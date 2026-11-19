const db = require('../config/db');
const { getRealSystemStats } = require('../utils/systemStats');
// GET /api/analytics/overview
exports.getOverview = async (req, res) => {
  try {
    const uid = req.user.id;

    const [[{ totalRequests }]] = await db.query(`
      SELECT COUNT(*) AS totalRequests FROM request_logs r
      LEFT JOIN websites w ON r.website_id = w.id WHERE w.user_id = ?
    `, [uid]);

    const [[{ hits }]] = await db.query(`
      SELECT COUNT(*) AS hits FROM request_logs r
      LEFT JOIN websites w ON r.website_id = w.id
      WHERE w.user_id = ? AND r.cache_result = 'HIT'
    `, [uid]);

    const [[{ avgResponse }]] = await db.query(`
      SELECT ROUND(AVG(response_time)) AS avgResponse FROM request_logs r
      LEFT JOIN websites w ON r.website_id = w.id WHERE w.user_id = ?
    `, [uid]);

    const [[{ onlineCount }]] = await db.query(`SELECT COUNT(*) AS onlineCount FROM edge_servers WHERE status = 'online'`);
    const [[{ totalEdges }]] = await db.query(`SELECT COUNT(*) AS totalEdges FROM edge_servers`);

    const cacheHitRatio = totalRequests > 0 ? Math.round((hits / totalRequests) * 1000) / 10 : 0;

    res.json({
      success: true,
      totalRequests,
      cacheHitRatio,
      activeEdgeServers: `${onlineCount}/${totalEdges}`,
      avgResponseTime: avgResponse || 0,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/analytics/traffic  (requests by edge location, for bar chart)
exports.getTraffic = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT e.location, COUNT(*) AS requests
      FROM request_logs r
      JOIN edge_servers e ON r.edge_server_id = e.id
      JOIN websites w ON r.website_id = w.id
      WHERE w.user_id = ?
      GROUP BY e.location
      ORDER BY requests DESC
    `, [req.user.id]);
    res.json({ success: true, traffic: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/analytics/performance  (cache HIT vs MISS, for doughnut chart)
exports.getPerformance = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT r.cache_result, COUNT(*) AS count
      FROM request_logs r
      JOIN websites w ON r.website_id = w.id
      WHERE w.user_id = ? AND r.cache_result IN ('HIT','MISS')
      GROUP BY r.cache_result
    `, [req.user.id]);
    res.json({ success: true, performance: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
// GET /api/analytics/real-system
exports.getRealSystem = async (req, res) => {
  try {
    const stats = getRealSystemStats();
    res.json({ success: true, ...stats });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};