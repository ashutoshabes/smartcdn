// Performs a REAL HTTP check against a website's actual origin,
// measuring genuine reachability and response time.
async function checkOriginHealth(domain, protocol) {
  const url = `${(protocol || 'https').toLowerCase()}://${domain}`;
  const start = Date.now();
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(url, {
      method: 'HEAD', // lightweight — we only need status, not full content
      signal: controller.signal,
      redirect: 'follow',
    });
    clearTimeout(timeout);

    const responseTimeMs = Date.now() - start;

    return {
      success: true,
      isUp: response.status < 500,
      statusCode: response.status,
      responseTimeMs,
      checkedAt: new Date().toISOString(),
    };
  } catch (err) {
    const responseTimeMs = Date.now() - start;
    return {
      success: true,
      isUp: false,
      statusCode: null,
      responseTimeMs,
      error: err.message,
      checkedAt: new Date().toISOString(),
    };
  }
}

module.exports = { checkOriginHealth };