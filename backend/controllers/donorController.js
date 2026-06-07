import pool from '../config/db.js';

const validateDonorInput = (age, blood_group, phone) => {
  if (age !== undefined) {
    const ageNum = parseInt(age, 10);
    if (isNaN(ageNum) || ageNum < 18 || ageNum > 65) {
      return 'Age must be an integer between 18 and 65 years';
    }
  }
  if (blood_group !== undefined) {
    const validGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    if (!validGroups.includes(blood_group)) {
      return 'Invalid blood group. Must be one of A+, A-, B+, B-, AB+, AB-, O+, O-';
    }
  }
  if (phone !== undefined) {
    const phoneStr = phone.toString().trim();
    if (phoneStr.length < 5 || phoneStr.length > 20) {
      return 'Phone number must be between 5 and 20 characters';
    }
  }
  return null;
};

/**
 * @desc    Create a new donor entry
 * @route   POST /api/donors
 * @access  Private
 */
export const createDonor = async (req, res, next) => {
  const { name, age, blood_group, phone, city, last_donation } = req.body;

  if (!name || age === undefined || !blood_group || !phone || !city) {
    res.status(400);
    return next(new Error('Please fill in all required fields'));
  }

  const validationError = validateDonorInput(age, blood_group, phone);
  if (validationError) {
    res.status(400);
    return next(new Error(validationError));
  }

  try {
    // If the logged-in user is not admin, we can auto-associate their user_id
    const userId = req.user.role === 'admin' ? (req.body.user_id || null) : req.user.id;

    // Check if the user already has a donor entry (unless admin)
    if (req.user.role !== 'admin' && userId) {
      const existingDonor = await pool.query('SELECT id FROM donors WHERE user_id = $1', [userId]);
      if (existingDonor.rows.length > 0) {
        res.status(400);
        return next(new Error('You have already registered as a donor. You can update your details instead.'));
      }
    }

    const newDonor = await pool.query(
      `INSERT INTO donors (name, age, blood_group, phone, city, last_donation, user_id) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING *`,
      [name, age, blood_group, phone, city, last_donation || null, userId]
    );

    // If a last_donation date is provided, we can optionally increment the blood bank inventory
    // standard flow: donor registration doesn't automatically add blood to inventory. Blood inventory is added by the admin when a donor actually donates, OR we can implement an option. To keep it clean, let's keep inventory updates under inventory route, or auto-add some units on donor creation. Let's make it manual for the admin or auto-increment.
    // Let's increment inventory by 1 unit for this blood group upon donor registration if they have donated recently (say, if last_donation is within last 3 months). But wait, keeping inventory managed explicitly by admin or via donation request is cleaner. Let's make a manual inventory panel.
    
    res.status(201).json(newDonor.rows[0]);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all donors (with search, filter, and pagination)
 * @route   GET /api/donors
 * @access  Private
 */
export const getDonors = async (req, res, next) => {
  const { blood_group, city, search, page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  try {
    let queryText = 'SELECT * FROM donors WHERE 1=1';
    const queryParams = [];
    let paramIndex = 1;

    if (blood_group) {
      queryText += ` AND blood_group = $${paramIndex}`;
      queryParams.push(blood_group);
      paramIndex++;
    }

    if (city) {
      queryText += ` AND LOWER(city) = LOWER($${paramIndex})`;
      queryParams.push(city);
      paramIndex++;
    }

    if (search) {
      queryText += ` AND (LOWER(name) LIKE LOWER($${paramIndex}) OR phone LIKE $${paramIndex})`;
      queryParams.push(`%${search}%`);
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
      donors: result.rows,
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
 * @desc    Get single donor details
 * @route   GET /api/donors/:id
 * @access  Private
 */
export const getDonorById = async (req, res, next) => {
  const { id } = req.params;

  try {
    const result = await pool.query('SELECT * FROM donors WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      res.status(404);
      return next(new Error('Donor not found'));
    }

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a donor's profile
 * @route   PUT /api/donors/:id
 * @access  Private
 */
export const updateDonor = async (req, res, next) => {
  const { id } = req.params;
  const { name, age, blood_group, phone, city, last_donation } = req.body;

  const validationError = validateDonorInput(age, blood_group, phone);
  if (validationError) {
    res.status(400);
    return next(new Error(validationError));
  }

  try {
    // Check if donor exists
    const donorQuery = await pool.query('SELECT * FROM donors WHERE id = $1', [id]);
    if (donorQuery.rows.length === 0) {
      res.status(404);
      return next(new Error('Donor not found'));
    }

    const donor = donorQuery.rows[0];

    // Access Control: Only admin or the owner (user_id matching req.user.id) can update
    if (req.user.role !== 'admin' && donor.user_id !== req.user.id) {
      res.status(403);
      return next(new Error('Not authorized to update this donor profile'));
    }

    const updatedDonor = await pool.query(
      `UPDATE donors 
       SET name = COALESCE($1, name),
           age = COALESCE($2, age),
           blood_group = COALESCE($3, blood_group),
           phone = COALESCE($4, phone),
           city = COALESCE($5, city),
           last_donation = COALESCE($6, last_donation)
       WHERE id = $7
       RETURNING *`,
      [name, age, blood_group, phone, city, last_donation, id]
    );

    res.json(updatedDonor.rows[0]);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a donor
 * @route   DELETE /api/donors/:id
 * @access  Private
 */
export const deleteDonor = async (req, res, next) => {
  const { id } = req.params;

  try {
    const donorQuery = await pool.query('SELECT * FROM donors WHERE id = $1', [id]);
    if (donorQuery.rows.length === 0) {
      res.status(404);
      return next(new Error('Donor not found'));
    }

    const donor = donorQuery.rows[0];

    // Access Control: Only admin or the owner can delete
    if (req.user.role !== 'admin' && donor.user_id !== req.user.id) {
      res.status(403);
      return next(new Error('Not authorized to delete this donor profile'));
    }

    await pool.query('DELETE FROM donors WHERE id = $1', [id]);
    res.json({ message: 'Donor removed successfully' });
  } catch (error) {
    next(error);
  }
};
