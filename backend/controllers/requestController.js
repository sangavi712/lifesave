import pool from '../config/db.js';

/**
 * @desc    Create a new blood request
 * @route   POST /api/requests
 * @access  Private
 */
export const createRequest = async (req, res, next) => {
  const { hospital, blood_group, units } = req.body;

  const trimmedHospital = hospital ? hospital.trim() : '';

  if (!trimmedHospital || !blood_group || units === undefined) {
    res.status(400);
    return next(new Error('Please provide hospital, blood group, and units requested'));
  }

  const validBloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  if (!validBloodGroups.includes(blood_group)) {
    res.status(400);
    return next(new Error('Invalid blood group. Must be one of A+, A-, B+, B-, AB+, AB-, O+, O-'));
  }

  const unitsNum = parseInt(units, 10);
  if (isNaN(unitsNum) || unitsNum <= 0) {
    res.status(400);
    return next(new Error('Units requested must be greater than 0'));
  }

  try {
    const newRequest = await pool.query(
      `INSERT INTO requests (hospital, blood_group, units, status, user_id)
       VALUES ($1, $2, $3, 'pending', $4)
       RETURNING *`,
      [trimmedHospital, blood_group, unitsNum, req.user.id]
    );

    res.status(201).json(newRequest.rows[0]);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all blood requests (admins see all, users see their own)
 * @route   GET /api/requests
 * @access  Private
 */
export const getRequests = async (req, res, next) => {
  const { blood_group, status, page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  try {
    let queryText = 'SELECT * FROM requests';
    const queryParams = [];
    let paramIndex = 1;

    // Access control: Users only see their own requests. Admins see all.
    if (req.user.role === 'admin') {
      queryText += ' WHERE 1=1';
    } else {
      queryText += ` WHERE user_id = $${paramIndex}`;
      queryParams.push(req.user.id);
      paramIndex++;
    }

    if (blood_group) {
      queryText += ` AND blood_group = $${paramIndex}`;
      queryParams.push(blood_group);
      paramIndex++;
    }

    if (status) {
      queryText += ` AND status = $${paramIndex}`;
      queryParams.push(status);
      paramIndex++;
    }

    // Clone query for count
    const countQueryText = queryText.replace('SELECT *', 'SELECT COUNT(*)');
    const totalCountResult = await pool.query(countQueryText, queryParams);
    const totalItems = parseInt(totalCountResult.rows[0].count, 10);

    // Add pagination
    queryText += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    queryParams.push(parseInt(limit, 10), offset);

    const result = await pool.query(queryText, queryParams);

    res.json({
      requests: result.rows,
      pagination: {
        totalItems,
        currentPage: parseInt(page, 10),
        totalPages: Math.ceil(totalItems / limit),
        limit: parseInt(limit, 10)
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a blood request's status (Approve or Reject)
 * @route   PUT /api/requests/:id/status
 * @access  Private/Admin
 */
export const updateRequestStatus = async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body; // 'approved' or 'rejected'

  if (!status || !['approved', 'rejected', 'pending'].includes(status)) {
    res.status(400);
    return next(new Error('Invalid status. Status must be approved, rejected, or pending.'));
  }

  // Transaction block to make sure inventory deduction is atomic and consistent
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Fetch the request details
    const requestQuery = await client.query('SELECT * FROM requests WHERE id = $1 FOR UPDATE', [id]);
    if (requestQuery.rows.length === 0) {
      res.status(404);
      throw new Error('Blood request not found');
    }

    const bloodRequest = requestQuery.rows[0];

    // If the status is already approved, prevent re-approving (which would deduct inventory twice)
    if (bloodRequest.status === 'approved' && status === 'approved') {
      res.status(400);
      throw new Error('Request has already been approved');
    }

    // If we are changing status to approved, check inventory and deduct units
    if (status === 'approved') {
      // Fetch current inventory units for the requested blood group
      const inventoryQuery = await client.query(
        'SELECT units FROM inventory WHERE blood_group = $1 FOR UPDATE',
        [bloodRequest.blood_group]
      );

      let currentUnits = 0;
      if (inventoryQuery.rows.length > 0) {
        currentUnits = inventoryQuery.rows[0].units;
      }

      if (currentUnits < bloodRequest.units) {
        res.status(400);
        throw new Error(
          `Insufficient blood units in stock for ${bloodRequest.blood_group}. Available: ${currentUnits} unit(s), Requested: ${bloodRequest.units} unit(s).`
        );
      }

      // Deduct inventory units
      await client.query(
        'UPDATE inventory SET units = units - $1, updated_at = CURRENT_TIMESTAMP WHERE blood_group = $2',
        [bloodRequest.units, bloodRequest.blood_group]
      );
    }

    // If the request was previously approved and now changed to rejected/pending, we restore the inventory
    if (bloodRequest.status === 'approved' && status !== 'approved') {
      await client.query(
        'UPDATE inventory SET units = units + $1, updated_at = CURRENT_TIMESTAMP WHERE blood_group = $2',
        [bloodRequest.units, bloodRequest.blood_group]
      );
    }

    // Update request status
    const updatedRequest = await client.query(
      'UPDATE requests SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );

    await client.query('COMMIT');
    res.json(updatedRequest.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
};

/**
 * @desc    Delete a blood request
 * @route   DELETE /api/requests/:id
 * @access  Private
 */
export const deleteRequest = async (req, res, next) => {
  const { id } = req.params;

  try {
    const requestQuery = await pool.query('SELECT * FROM requests WHERE id = $1', [id]);
    if (requestQuery.rows.length === 0) {
      res.status(404);
      return next(new Error('Blood request not found'));
    }

    const bloodRequest = requestQuery.rows[0];

    // Access control: User can only delete their own requests. Admins can delete any.
    if (req.user.role !== 'admin' && bloodRequest.user_id !== req.user.id) {
      res.status(403);
      return next(new Error('Not authorized to delete this request'));
    }

    // Prevent deleting approved requests to keep transaction logs consistent, or revert inventory if approved.
    // For safety, only allow deleting non-approved requests, or admin can delete.
    if (bloodRequest.status === 'approved' && req.user.role !== 'admin') {
      res.status(400);
      return next(new Error('Approved requests cannot be deleted. Contact administrator if needed.'));
    }

    // If deleting an approved request (by admin), restore the inventory units
    if (bloodRequest.status === 'approved') {
      await pool.query(
        'UPDATE inventory SET units = units + $1, updated_at = CURRENT_TIMESTAMP WHERE blood_group = $2',
        [bloodRequest.units, bloodRequest.blood_group]
      );
    }

    await pool.query('DELETE FROM requests WHERE id = $1', [id]);
    res.json({ message: 'Request deleted successfully' });
  } catch (error) {
    next(error);
  }
};
