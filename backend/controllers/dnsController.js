const db = require('../config/db');

async function assertOwnership(websiteId, userId) {
  const [[site]] = await db.query('SELECT id FROM websites WHERE id = ? AND user_id = ?', [websiteId, userId]);
  return !!site;
}

exports.getRecords = async (req, res) => {
  try {
    const { websiteId } = req.params;
    if (!(await assertOwnership(websiteId, req.user.id))) {
      return res.status(403).json({ success: false, message: 'Not authorized for this website' });
    }
    const [rows] = await db.query('SELECT * FROM dns_records WHERE website_id = ? ORDER BY type ASC', [websiteId]);
    res.json({ success: true, records: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.addRecord = async (req, res) => {
  try {
    const { websiteId } = req.params;
    if (!(await assertOwnership(websiteId, req.user.id))) {
      return res.status(403).json({ success: false, message: 'Not authorized for this website' });
    }
    const { type, name, value, ttl, proxied } = req.body;
    if (!type || !name || !value) {
      return res.status(400).json({ success: false, message: 'Type, name, and value are required' });
    }
    const [result] = await db.query(
      'INSERT INTO dns_records (website_id, type, name, value, ttl, proxied) VALUES (?, ?, ?, ?, ?, ?)',
      [websiteId, type, name, value, ttl || 3600, proxied !== false]
    );
    res.status(201).json({ success: true, id: result.insertId });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateRecord = async (req, res) => {
  try {
    const { type, name, value, ttl, proxied } = req.body;
    const [[record]] = await db.query(`
      SELECT d.id FROM dns_records d
      JOIN websites w ON d.website_id = w.id
      WHERE d.id = ? AND w.user_id = ?
    `, [req.params.id, req.user.id]);
    if (!record) return res.status(403).json({ success: false, message: 'Not authorized' });

    await db.query(
      'UPDATE dns_records SET type = ?, name = ?, value = ?, ttl = ?, proxied = ? WHERE id = ?',
      [type, name, value, ttl, proxied, req.params.id]
    );
    res.json({ success: true, message: 'DNS record updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteRecord = async (req, res) => {
  try {
    const [[record]] = await db.query(`
      SELECT d.id FROM dns_records d
      JOIN websites w ON d.website_id = w.id
      WHERE d.id = ? AND w.user_id = ?
    `, [req.params.id, req.user.id]);
    if (!record) return res.status(403).json({ success: false, message: 'Not authorized' });

    await db.query('DELETE FROM dns_records WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'DNS record deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};