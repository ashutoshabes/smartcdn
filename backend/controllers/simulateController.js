const db = require('../config/db');
const { selectEdgeServer } = require('../utils/routingEngine');
const USER_LOCATIONS = require('../utils/userLocations');

function genRequestId() {
  return 'REQ-' + Math.random().toString(36).slice(2, 8).toUpperCase();
}

// Actually fetches real content from the real website's origin,
// measuring genuine network time — not simulated.
async function fetchRealContent(domain, protocol, contentPath) {
  const url = `${protocol.toLowerCase()}://${domain}${contentPath.startsWith('/') ? contentPath : '/' + contentPath}`;
  const start = Date.now();
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000); // 5s real timeout

    const response = await fetch(url, { signal: controller.signal, redirect: 'follow' });
    clearTimeout(timeout);

    const body = await response.text();
    const durationMs = Date.now() - start;
    const sizeKB = Math.round(Buffer.byteLength(body, 'utf8') / 1024);

    // Read the REAL Cache-Control header the website actually sent back
    const cacheControlHeader = response.headers.get('cache-control') || '';
    let realMaxAge = null;
    const maxAgeMatch = cacheControlHeader.match(/max-age=(\d+)/);
    if (maxAgeMatch) {
      realMaxAge = parseInt(maxAgeMatch[1], 10);
    }
    const isNoStore = /no-store|no-cache/i.test(cacheControlHeader);

    return {
      success: true,
      statusCode: response.status,
      sizeKB: Math.max(sizeKB, 1),
      durationMs,
      url,
      cacheControlHeader: cacheControlHeader || null,
      realMaxAge,
      isNoStore,
    };
  } catch (err) {
    const durationMs = Date.now() - start;
    return { success: false, error: err.message, durationMs, url };
  }
}

// POST /api/simulate/request
exports.simulateRequest = async (req, res) => {
  try {
    const { website_id, user_location, content_path, realLatencyMs } = req.body;

    if (!website_id || !user_location || !content_path) {
      return res.status(400).json({ success: false, message: 'website_id, user_location, and content_path are required' });
    }

    const coords = USER_LOCATIONS[user_location];
    if (!coords) {
      return res.status(400).json({ success: false, message: 'Unknown user_location' });
    }

    // Get the website (to know its TTL) and all edge servers
    const [[website]] = await db.query('SELECT * FROM websites WHERE id = ?', [website_id]);
    const [edgeServers] = await db.query('SELECT * FROM edge_servers');

    const routing = selectEdgeServer(coords.lat, coords.lng, edgeServers, 'smart', realLatencyMs || null);

    // ---- Total outage: every edge server is offline ----
    if (!routing) {
      const requestId = genRequestId();
      await db.query(
        `INSERT INTO request_logs (request_id, website_id, user_location, edge_server_id, content_path, cache_result, response_time, status)
         VALUES (?, ?, ?, NULL, ?, 'N/A', 0, 'error')`,
        [requestId, website_id, user_location, content_path]
      );
      return res.json({ success: false, message: 'All edge servers are offline', requestId });
    }

    const edgeServerId = routing.server.id;
    const ttl = website?.cache_ttl || 3600;

    // ---- Check cache: does a fresh entry already exist? ----
    const [[cacheRow]] = await db.query(
      `SELECT * FROM cache_entries
       WHERE website_id = ? AND edge_server_id = ? AND content_path = ?
       AND last_accessed > (NOW() - INTERVAL ttl SECOND)`,
      [website_id, edgeServerId, content_path]
    );

    let cacheResult;
    let originHit = false;
    let realFetch = null;

    if (cacheRow) {
      cacheResult = 'HIT';
      await db.query('UPDATE cache_entries SET last_accessed = NOW() WHERE id = ?', [cacheRow.id]);
       } else {
      cacheResult = 'MISS';
      originHit = true;

      // Actually fetch real content from the real website
      realFetch = await fetchRealContent(website.domain, website.protocol || 'https', content_path);

      const finalSize = realFetch.success ? realFetch.sizeKB : (20 + Math.round(Math.random() * 500));

      // Respect the REAL Cache-Control header from the real website when available,
      // instead of blindly using our own configured TTL — this is genuinely how
      // real CDNs behave: they honor the origin's own caching policy.
      let effectiveTtl = ttl;
      if (realFetch.success) {
        if (realFetch.isNoStore) {
          effectiveTtl = 0; // origin explicitly said not to cache this
        } else if (realFetch.realMaxAge !== null) {
          effectiveTtl = realFetch.realMaxAge;
        }
      }

      if (effectiveTtl > 0) {
        await db.query(
          `INSERT INTO cache_entries (website_id, edge_server_id, content_path, cache_status, ttl, size)
           VALUES (?, ?, ?, 'HIT', ?, ?)
           ON DUPLICATE KEY UPDATE last_accessed = NOW(), size = VALUES(size), ttl = VALUES(ttl)`,
          [website_id, edgeServerId, content_path, effectiveTtl, finalSize]
        );
      }
      // If effectiveTtl is 0 (real no-store), we deliberately DON'T cache it —
      // matching real-world behavior where some content should never be cached.
    }

    const originPenalty = originHit ? 35 + Math.random() * 45 : 0;
    const responseTime = Math.round(routing.latency + originPenalty + Math.random() * 4);
    const requestId = genRequestId();

    await db.query(
      `INSERT INTO request_logs (request_id, website_id, user_location, edge_server_id, content_path, cache_result, response_time, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'success')`,
      [requestId, website_id, user_location, edgeServerId, content_path, cacheResult, responseTime]
    );

    // Nudge the edge server's live "current_requests" counter, for realism
    await db.query('UPDATE edge_servers SET current_requests = current_requests + 1 WHERE id = ?', [edgeServerId]);

    res.json({
      success: true,
      requestId,
      edgeServer: routing.server.name,
      edgeServerLocation: routing.server.location,
      cacheResult,
      responseTime,
      routingDetail: {
        distanceKm: routing.distanceKm,
        latency: routing.latency,
        locationScore: routing.locationScore,
        latencyScore: routing.latencyScore,
        loadScore: routing.loadScore,
        finalScore: routing.score,
      },
      realFetch,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/simulate/detect-location
// Detects the REAL geographic location of the incoming request's IP address,
// using a free public geolocation API — genuine data, not simulated.
exports.detectLocation = async (req, res) => {
  try {
    let clientIp = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress;
    if (clientIp === '::1' || clientIp === '127.0.0.1') {
      // Localhost during development has no real public IP —
      // fall back to letting the API auto-detect the caller's IP instead.
      clientIp = '';
    }

    const url = clientIp ? `http://ip-api.com/json/${clientIp}` : `http://ip-api.com/json/`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'fail') {
      return res.status(400).json({ success: false, message: 'Could not detect location' });
    }

    res.json({
      success: true,
      city: data.city,
      country: data.country,
      lat: data.lat,
      lng: data.lon,
      ip: data.query,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};