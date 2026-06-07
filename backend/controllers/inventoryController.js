import pool from '../config/db.js';

/**
 * @desc    Get current blood inventory levels
 * @route   GET /api/inventory
 * @access  Private
 */
export const getInventory = async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM inventory ORDER BY blood_group ASC');
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update stock units for a blood group (Admin only)
 * @route   PUT /api/inventory
 * @access  Private/Admin
 */
export const updateInventory = async (req, res, next) => {
  const { blood_group, units } = req.body;

  if (!blood_group || units === undefined) {
    res.status(400);
    return next(new Error('Please provide blood group and unit count'));
  }

  const validBloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  if (!validBloodGroups.includes(blood_group)) {
    res.status(400);
    return next(new Error('Invalid blood group. Must be one of A+, A-, B+, B-, AB+, AB-, O+, O-'));
  }

  const parsedUnits = parseInt(units, 10);
  if (isNaN(parsedUnits) || parsedUnits < 0) {
    res.status(400);
    return next(new Error('Units must be a non-negative integer'));
  }

  try {
    const result = await pool.query(
      `INSERT INTO inventory (blood_group, units) 
       VALUES ($1, $2)
       ON CONFLICT (blood_group) 
       DO UPDATE SET units = $2, updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [blood_group, parsedUnits]
    );

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};
