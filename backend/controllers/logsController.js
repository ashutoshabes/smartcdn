const db = require('../config/db');

// GET /api/logs?page=1&limit=20
exports.getLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const [rows] = await db.query(`
      SELECT r.*, w.domain, e.name AS edge_server_name
      FROM request_logs r
      LEFT JOIN websites w ON r.website_id = w.id
      LEFT JOIN edge_servers e ON r.edge_server_id = e.id
      WHERE w.user_id = ?
      ORDER BY r.created_at DESC
      LIMIT ? OFFSET ?
    `, [req.user.id, limit, offset]);

    const [[{ total }]] = await db.query(`
      SELECT COUNT(*) AS total FROM request_logs r
      LEFT JOIN websites w ON r.website_id = w.id
      WHERE w.user_id = ?
    `, [req.user.id]);

    res.json({ success: true, logs: rows, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};