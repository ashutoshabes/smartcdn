// ============================================================
// SmartCDN Intelligent Routing Engine
//
// Given a user's approximate lat/lng and the list of edge
// servers, picks the best ONLINE server using a weighted score:
//
//   Routing Score = LocationScore * 0.5
//                 + LatencyScore  * 0.3
//                 + LoadScore     * 0.2
//
// LocationScore -> based on distance (closer = higher score)
// LatencyScore  -> based on the server's live latency reading
// LoadScore     -> based on CPU usage + current active requests
//
// Only ONLINE servers are ever scored, so an offline server can
// never be selected — this is what gives us automatic failover.
// ============================================================

function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

function scoreEdgeServers(userLat, userLng, edgeServers, routingMode = 'smart', realLatencyMs = null) {
  const onlineServers = edgeServers.filter((s) => s.status === 'online');
  const maxDist = 20000;

  const scored = onlineServers.map((server) => {
    const distanceKm = haversineKm(userLat, userLng, server.lat, server.lng);
    const locationScore = Math.max(0, 100 - (distanceKm / maxDist) * 100);

        // If a real measured latency was provided (e.g. from a real Cloudflare ping),
    // blend it in as a genuine real-world signal instead of relying purely on
    // the simulated latency formula.
    const simulatedLatency = Math.round(server.latency + distanceKm / 300 + Math.random() * 6);
    const latency = realLatencyMs ? Math.round((simulatedLatency + realLatencyMs) / 2) : simulatedLatency;
    const latencyScore = Math.max(0, 100 - latency * 1.4);

    const load = server.cpu_usage * 0.6 + server.current_requests / 10;
    const loadScore = Math.max(0, 100 - load / 2);

    let score;
    if (routingMode === 'lowest_latency') score = latencyScore;
    else if (routingMode === 'lowest_load') score = loadScore;
    else score = locationScore * 0.5 + latencyScore * 0.3 + loadScore * 0.2;

    return {
      server,
      distanceKm: Math.round(distanceKm),
      latency,
      locationScore: Math.round(locationScore),
      latencyScore: Math.round(latencyScore),
      loadScore: Math.round(loadScore),
      score: Math.round(score * 100) / 100,
    };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored;
}

function selectEdgeServer(userLat, userLng, edgeServers, routingMode = 'smart', realLatencyMs = null) {
  const ranked = scoreEdgeServers(userLat, userLng, edgeServers, routingMode, realLatencyMs);
  return ranked.length > 0 ? ranked[0] : null;
}

module.exports = { scoreEdgeServers, selectEdgeServer };