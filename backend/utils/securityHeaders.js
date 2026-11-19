// Checks REAL HTTP response headers from a real website — genuine
// security posture inspection, the same approach tools like
// securityheaders.com use.
const CHECKED_HEADERS = [
  { key: 'strict-transport-security', label: 'HSTS (Strict-Transport-Security)', weight: 20 },
  { key: 'x-frame-options', label: 'X-Frame-Options', weight: 15 },
  { key: 'x-content-type-options', label: 'X-Content-Type-Options', weight: 15 },
  { key: 'content-security-policy', label: 'Content-Security-Policy', weight: 25 },
  { key: 'referrer-policy', label: 'Referrer-Policy', weight: 15 },
  { key: 'permissions-policy', label: 'Permissions-Policy', weight: 10 },
];

async function auditSecurityHeaders(domain, protocol) {
  const url = `${(protocol || 'https').toLowerCase()}://${domain}`;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    const response = await fetch(url, { method: 'GET', signal: controller.signal, redirect: 'follow' });
    clearTimeout(timeout);

    const results = CHECKED_HEADERS.map((h) => {
      const value = response.headers.get(h.key);
      return {
        label: h.label,
        present: !!value,
        value: value || null,
        weight: h.weight,
      };
    });

    const score = results.reduce((sum, r) => sum + (r.present ? r.weight : 0), 0);
    const serverHeader = response.headers.get('server') || null;

    return {
      success: true,
      score,
      maxScore: 100,
      results,
      serverHeader,
      statusCode: response.status,
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

module.exports = { auditSecurityHeaders };