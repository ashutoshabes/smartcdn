const express = require('express');
const cors = require('cors');
require('dotenv').config();

const db = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const websiteRoutes = require('./routes/websiteRoutes');
const dnsRoutes = require('./routes/dnsRoutes');
const securityRoutes = require('./routes/securityRoutes');
const sslRoutes = require('./routes/sslRoutes');
const edgeRoutes = require('./routes/edgeRoutes');
const simulateRoutes = require('./routes/simulateRoutes');
const cacheRoutes = require('./routes/cacheRoutes');
const logsRoutes = require('./routes/logsRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map((origin) => origin.trim())
  : true;
app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/websites', websiteRoutes);
app.use('/api/dns', dnsRoutes);
app.use('/api/security', securityRoutes);
app.use('/api/ssl', sslRoutes);
app.use('/api/edges', edgeRoutes);
app.use('/api/simulate', simulateRoutes);
app.use('/api/cache', cacheRoutes);
app.use('/api/logs', logsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/settings', settingsRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'smartcdn-backend' });
});

app.get('/', (req, res) => {
  res.json({ message: 'SmartCDN backend is running 🚀' });
});

app.get('/api/test-db', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT COUNT(*) AS total FROM edge_servers');
    res.json({ success: true, edgeServerCount: rows[0].total });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`SmartCDN backend listening on port ${PORT}`);
});