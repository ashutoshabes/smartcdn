const WORKER_URL = 'https://divine-sun-051c.dbnsashutosh.workers.dev/';

// Tests REAL WAF blocking against your live Cloudflare Worker.
// If blockCountry is provided, the Worker will genuinely block
// the request if it actually originates from that country.
export async function testRealWaf(blockCountry) {
  const url = blockCountry
    ? `${WORKER_URL}?block=${encodeURIComponent(blockCountry)}`
    : WORKER_URL;

  try {
    const res = await fetch(url, { cache: 'no-store' });
    const data = await res.json();
    return {
      success: true,
      httpStatus: res.status,
      blocked: data.blocked === true,
      data,
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
}