const PING_URL = 'https://divine-sun-051c.dbnsashutosh.workers.dev/';

// Measures real round-trip time to Cloudflare's real edge network,
// and returns which actual data center responded.
export async function measureRealLatency() {
  const start = performance.now();
  try {
    const res = await fetch(PING_URL, { cache: 'no-store' });
    const data = await res.json();
    const end = performance.now();
    const latencyMs = Math.round(end - start);

    return {
      success: true,
      latencyMs,
      servedFrom: data.servedFrom, // { colo, country, city }
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
}