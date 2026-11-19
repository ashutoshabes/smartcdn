const db = require('../config/db');
const { auditSecurityHeaders } = require('../utils/securityHeaders');
async function assertOwnership(websiteId, userId) {
  const [[site]] = await db.query('SELECT id FROM websites WHERE id = ? AND user_id = ?', [websiteId, userId]);
  return !!site;
}

// GET /api/security/:websiteId/rules
exports.getRules = async (req, res) => {
  try {
    const { websiteId } = req.params;
    if (!(await assertOwnership(websiteId, req.user.id))) {
      return res.status(403).json({ success: false, message: 'Not authorized for this website' });
    }
    const [rows] = await db.query('SELECT * FROM security_rules WHERE website_id = ? ORDER BY created_at DESC', [websiteId]);
    res.json({ success: true, rules: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/security/:websiteId/rules
exports.addRule = async (req, res) => {
  try {
    const { websiteId } = req.params;
    if (!(await assertOwnership(websiteId, req.user.id))) {
      return res.status(403).json({ success: false, message: 'Not authorized for this website' });
    }
    const { rule_type, value, action } = req.body;
    if (!rule_type || !value) {
      return res.status(400).json({ success: false, message: 'Rule type and value are required' });
    }
    const [result] = await db.query(
      'INSERT INTO security_rules (website_id, rule_type, value, action) VALUES (?, ?, ?, ?)',
      [websiteId, rule_type, value, action || 'block']
    );
    res.status(201).json({ success: true, id: result.insertId });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/security/rules/:id/toggle
exports.toggleRule = async (req, res) => {
  try {
    const [[rule]] = await db.query(`
      SELECT r.id, r.enabled FROM security_rules r
      JOIN websites w ON r.website_id = w.id
      WHERE r.id = ? AND w.user_id = ?
    `, [req.params.id, req.user.id]);
    if (!rule) return res.status(403).json({ success: false, message: 'Not authorized' });

    await db.query('UPDATE security_rules SET enabled = ? WHERE id = ?', [!rule.enabled, req.params.id]);
    res.json({ success: true, message: 'Rule updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/security/rules/:id
exports.deleteRule = async (req, res) => {
  try {
    const [[rule]] = await db.query(`
      SELECT r.id FROM security_rules r
      JOIN websites w ON r.website_id = w.id
      WHERE r.id = ? AND w.user_id = ?
    `, [req.params.id, req.user.id]);
    if (!rule) return res.status(403).json({ success: false, message: 'Not authorized' });

    await db.query('DELETE FROM security_rules WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Rule deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/security/:websiteId/events
exports.getEvents = async (req, res) => {
  try {
    const { websiteId } = req.params;
    if (!(await assertOwnership(websiteId, req.user.id))) {
      return res.status(403).json({ success: false, message: 'Not authorized for this website' });
    }
    const [rows] = await db.query(
      'SELECT * FROM firewall_events WHERE website_id = ? ORDER BY created_at DESC LIMIT 50',
      [websiteId]
    );
    res.json({ success: true, events: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
// GET /api/security/:websiteId/headers-audit
exports.headersAudit = async (req, res) => {
  try {
    const { websiteId } = req.params;
    if (!(await assertOwnership(websiteId, req.user.id))) {
      return res.status(403).json({ success: false, message: 'Not authorized for this website' });
    }
    const [[site]] = await db.query('SELECT domain, protocol FROM websites WHERE id = ?', [websiteId]);
    const audit = await auditSecurityHeaders(site.domain, site.protocol);
    res.json(audit);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};