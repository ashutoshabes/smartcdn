const db = require('../config/db');

// GET /api/edges
exports.getEdgeServers = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM edge_servers ORDER BY name ASC');
    // Add small live jitter for display purposes only — not persisted to DB,
    // so refreshing doesn't cause values to drift permanently over time.
    const live = rows.map((s) => {
      if (s.status !== 'online') return s;
      const jitter = (range) => Math.max(0, Math.min(100, s.cpu_usage + (Math.random() * range - range / 2)));
      return {
        ...s,
        cpu_usage: Math.round(jitter(14)),
        memory_usage: Math.round(Math.max(0, Math.min(100, s.memory_usage + (Math.random() * 10 - 5)))),
        current_requests: Math.max(0, s.current_requests + Math.round(Math.random() * 6 - 3)),
        latency: Math.max(3, Math.round(s.latency + (Math.random() * 4 - 2))),
      };
    });
    res.json({ success: true, edgeServers: live });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/edges
exports.addEdgeServer = async (req, res) => {
  try {
    const { name, location, region, ip_address, lat, lng } = req.body;
    if (!name || !location || !ip_address) {
      return res.status(400).json({ success: false, message: 'Name, location, and IP are required' });
    }
    const [result] = await db.query(
      `INSERT INTO edge_servers (name, location, region, ip_address, lat, lng)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, location, region || '', ip_address, lat || null, lng || null]
    );
    res.status(201).json({ success: true, id: result.insertId });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/edges/:id  (full edit)
exports.updateEdgeServer = async (req, res) => {
  try {
    const { name, location, region, ip_address, cpu_usage, memory_usage } = req.body;
    await db.query(
      `UPDATE edge_servers SET name = ?, location = ?, region = ?, ip_address = ?, cpu_usage = ?, memory_usage = ?
       WHERE id = ?`,
      [name, location, region, ip_address, cpu_usage, memory_usage, req.params.id]
    );
    res.json({ success: true, message: 'Edge server updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/edges/:id/status  (used by the Online/Offline toggle)
exports.updateEdgeStatus = async (req, res) => {
  try {
    const { status } = req.body; // 'online' | 'offline' | 'maintenance'
    if (!['online', 'offline', 'maintenance'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }
    await db.query('UPDATE edge_servers SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ success: true, message: `Server marked ${status}` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};