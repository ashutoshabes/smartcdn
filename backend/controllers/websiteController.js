const db = require('../config/db');
const dns = require('dns').promises;
const { checkOriginHealth } = require('../utils/healthChecker');
async function domainExists(domain) {
  try {
    await dns.lookup(domain);
    return true;
  } catch (err) {
    return false;
  }
}

// GET /api/websites
exports.getWebsites = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM websites WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json({ success: true, websites: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.addWebsite = async (req, res) => {
  try {
    const { domain, origin_server, protocol, cache_ttl } = req.body;
    if (!domain || !origin_server) {
      return res.status(400).json({ success: false, message: 'Domain and origin server are required' });
    }

    // Real DNS check — confirms this domain genuinely exists on the internet
    const exists = await domainExists(domain);
    if (!exists) {
      return res.status(400).json({ success: false, message: `Domain "${domain}" does not resolve — please enter a real, valid domain.` });
    }

    const [result] = await db.query(
      'INSERT INTO websites (user_id, domain, origin_server, protocol, cache_ttl) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, domain, origin_server, protocol || 'HTTPS', cache_ttl || 3600]
    );
    res.status(201).json({ success: true, id: result.insertId });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/websites/:id
exports.updateWebsite = async (req, res) => {
  try {
    const { domain, origin_server, protocol, cache_ttl, status } = req.body;
    await db.query(
      `UPDATE websites SET domain = ?, origin_server = ?, protocol = ?, cache_ttl = ?, status = ?
       WHERE id = ? AND user_id = ?`,
      [domain, origin_server, protocol, cache_ttl, status, req.params.id, req.user.id]
    );
    res.json({ success: true, message: 'Website updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/websites/:id
exports.deleteWebsite = async (req, res) => {
  try {
    await db.query('DELETE FROM websites WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    res.json({ success: true, message: 'Website deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
// GET /api/websites/:id/health
exports.checkHealth = async (req, res) => {
  try {
    const [[site]] = await db.query('SELECT * FROM websites WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (!site) {
      return res.status(403).json({ success: false, message: 'Not authorized for this website' });
    }

    const health = await checkOriginHealth(site.domain, site.protocol);
    res.json({ success: true, ...health });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};