const db = require('../config/db');
const { checkSSLCertificate } = require('../utils/sslChecker');

// GET /api/ssl/:websiteId
exports.checkCertificate = async (req, res) => {
  try {
    const { websiteId } = req.params;
    const [[site]] = await db.query('SELECT * FROM websites WHERE id = ? AND user_id = ?', [websiteId, req.user.id]);
    if (!site) {
      return res.status(403).json({ success: false, message: 'Not authorized for this website' });
    }

    const result = await checkSSLCertificate(site.domain);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};