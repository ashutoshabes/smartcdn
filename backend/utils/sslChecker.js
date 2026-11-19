const tls = require('tls');

// Connects to a real domain's real HTTPS port and reads its actual
// live SSL/TLS certificate — genuine cryptographic data, not simulated.
function checkSSLCertificate(domain) {
  return new Promise((resolve) => {
    const socket = tls.connect(
      {
        host: domain,
        port: 443,
        servername: domain, // required for SNI
        timeout: 5000,
        rejectUnauthorized: false, // we want to inspect even if there are issues, not throw
      },
      () => {
        const cert = socket.getPeerCertificate();
        socket.end();

        if (!cert || Object.keys(cert).length === 0) {
          return resolve({ success: false, error: 'No certificate found' });
        }

        const now = new Date();
        const validTo = new Date(cert.valid_to);
        const validFrom = new Date(cert.valid_from);
        const daysRemaining = Math.round((validTo - now) / (1000 * 60 * 60 * 24));

        resolve({
          success: true,
          issuer: cert.issuer?.O || cert.issuer?.CN || 'Unknown',
          subject: cert.subject?.CN || domain,
          validFrom: validFrom.toISOString(),
          validTo: validTo.toISOString(),
          daysRemaining,
          isExpired: daysRemaining < 0,
          isExpiringSoon: daysRemaining >= 0 && daysRemaining < 30,
        });
      }
    );

    socket.on('error', (err) => {
      resolve({ success: false, error: err.message });
    });

    socket.on('timeout', () => {
      socket.destroy();
      resolve({ success: false, error: 'Connection timed out' });
    });
  });
}

module.exports = { checkSSLCertificate };