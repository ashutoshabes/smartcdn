const db = require('../config/db');

// GET /api/settings
exports.getSettings = async (req, res) => {
  try {
    const [[settings]] = await db.query('SELECT * FROM user_settings WHERE user_id = ?', [req.user.id]);
    res.json({ success: true, settings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/settings
exports.updateSettings = async (req, res) => {
  try {
    const { default_cache_ttl, routing_mode, cache_enabled, failover_enabled, analytics_enabled } = req.body;
    await db.query(
      `UPDATE user_settings SET default_cache_ttl = ?, routing_mode = ?, cache_enabled = ?, failover_enabled = ?, analytics_enabled = ?
       WHERE user_id = ?`,
      [default_cache_ttl, routing_mode, cache_enabled, failover_enabled, analytics_enabled, req.user.id]
    );
    res.json({ success: true, message: 'Settings updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};