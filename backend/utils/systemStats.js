const os = require('os');

// Reads REAL system information from the actual machine running this
// backend — genuine OS-level data, not simulated.
function getRealSystemStats() {
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMemPercent = Math.round(((totalMem - freeMem) / totalMem) * 100);

  return {
    platform: os.platform(),
    cpuCores: os.cpus().length,
    totalMemoryGB: Math.round((totalMem / 1024 / 1024 / 1024) * 10) / 10,
    freeMemoryGB: Math.round((freeMem / 1024 / 1024 / 1024) * 10) / 10,
    usedMemoryPercent: usedMemPercent,
    processUptimeSeconds: Math.round(process.uptime()),
    nodeVersion: process.version,
  };
}

module.exports = { getRealSystemStats };