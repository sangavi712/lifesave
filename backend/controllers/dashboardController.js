import pool from '../config/db.js';

/**
 * @desc    Get dashboard statistics
 * @route   GET /api/dashboard/stats
 * @access  Private
 */
export const getDashboardStats = async (req, res, next) => {
  try {
    const isAdmin = req.user.role === 'admin';

    if (isAdmin) {
      // 1. Total units in inventory
      const inventorySum = await pool.query('SELECT SUM(units) FROM inventory');
      const totalUnits = parseInt(inventorySum.rows[0].sum || '0', 10);

      // 2. Total donors
      const donorsCount = await pool.query('SELECT COUNT(*) FROM donors');
      const totalDonors = parseInt(donorsCount.rows[0].count, 10);

      // 3. Pending requests
      const pendingReqCount = await pool.query("SELECT COUNT(*) FROM requests WHERE status = 'pending'");
      const pendingRequests = parseInt(pendingReqCount.rows[0].count, 10);

      // 4. Approved requests
      const approvedReqCount = await pool.query("SELECT COUNT(*) FROM requests WHERE status = 'approved'");
      const approvedRequests = parseInt(approvedReqCount.rows[0].count, 10);

      // 5. Total users
      const usersCount = await pool.query('SELECT COUNT(*) FROM users');
      const totalUsers = parseInt(usersCount.rows[0].count, 10);

      // 6. Recent requests (last 5)
      const recentRequests = await pool.query(
        `SELECT r.*, u.name as user_name 
         FROM requests r 
         LEFT JOIN users u ON r.user_id = u.id 
         ORDER BY r.created_at DESC LIMIT 5`
      );

      // 7. Recent donors (last 5)
      const recentDonors = await pool.query(
        'SELECT * FROM donors ORDER BY created_at DESC LIMIT 5'
      );

      // 8. Blood group distribution in stock
      const inventoryDistribution = await pool.query(
        'SELECT blood_group, units FROM inventory ORDER BY blood_group ASC'
      );

      res.json({
        isAdmin: true,
        stats: {
          totalUnits,
          totalDonors,
          pendingRequests,
          approvedRequests,
          totalUsers
        },
        recentRequests: recentRequests.rows,
        recentDonors: recentDonors.rows,
        inventoryDistribution: inventoryDistribution.rows
      });
    } else {
      // User specific dashboard statistics
      const userId = req.user.id;

      // 1. User's total requests
      const userRequests = await pool.query('SELECT COUNT(*) FROM requests WHERE user_id = $1', [userId]);
      const totalRequests = parseInt(userRequests.rows[0].count, 10);

      // 2. User's pending requests
      const userPending = await pool.query(
        "SELECT COUNT(*) FROM requests WHERE user_id = $1 AND status = 'pending'",
        [userId]
      );
      const pendingRequests = parseInt(userPending.rows[0].count, 10);

      // 3. User's approved requests
      const userApproved = await pool.query(
        "SELECT COUNT(*) FROM requests WHERE user_id = $1 AND status = 'approved'",
        [userId]
      );
      const approvedRequests = parseInt(userApproved.rows[0].count, 10);

      // 4. Is current user registered as donor?
      const userDonor = await pool.query('SELECT * FROM donors WHERE user_id = $1', [userId]);
      const isDonor = userDonor.rows.length > 0;
      const donorDetails = isDonor ? userDonor.rows[0] : null;

      // 5. User's own recent requests
      const recentRequests = await pool.query(
        'SELECT * FROM requests WHERE user_id = $1 ORDER BY created_at DESC LIMIT 5',
        [userId]
      );

      // 6. Global inventory snapshot (available to users to check what blood groups are in stock)
      const inventoryDistribution = await pool.query(
        'SELECT blood_group, units FROM inventory ORDER BY blood_group ASC'
      );

      res.json({
        isAdmin: false,
        stats: {
          totalRequests,
          pendingRequests,
          approvedRequests,
          isDonor
        },
        donorDetails,
        recentRequests: recentRequests.rows,
        inventoryDistribution: inventoryDistribution.rows
      });
    }
  } catch (error) {
    next(error);
  }
};
