const db = require('../config/db');

// GET /api/cache
exports.getCache = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT c.*, e.name AS edge_server_name, w.domain
      FROM cache_entries c
      JOIN edge_servers e ON c.edge_server_id = e.id
      JOIN websites w ON c.website_id = w.id
      WHERE w.user_id = ?
      ORDER BY c.last_accessed DESC
    `, [req.user.id]);
    res.json({ success: true, cache: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/cache/:id
exports.deleteCacheEntry = async (req, res) => {
  try {
    await db.query('DELETE FROM cache_entries WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Cache entry deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/cache/clear
exports.clearCache = async (req, res) => {
  try {
    await db.query(`
      DELETE c FROM cache_entries c
      JOIN websites w ON c.website_id = w.id
      WHERE w.user_id = ?
    `, [req.user.id]);
    res.json({ success: true, message: 'Cache cleared' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};