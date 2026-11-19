import { useState, useEffect } from 'react';
import { Send, Loader2, Zap } from 'lucide-react';
import { api } from '../../services/api';
import SimulatorFlow from '../../components/SimulatorFlow';
import { measureRealLatency } from '../../utils/realLatency';

const USER_LOCATIONS = ['India', 'Singapore', 'Japan', 'UK', 'Germany', 'USA East', 'USA West'];
const CONTENT_ITEMS = ['/index.html', '/images/banner.jpg', '/assets/style.css', '/video/demo.mp4'];

export default function Simulator() {
  const [websites, setWebsites] = useState([]);
  const [websiteId, setWebsiteId] = useState('');
  const [userLocation, setUserLocation] = useState('India');
  const [contentPath, setContentPath] = useState('/index.html');

  const [stage, setStage] = useState(null);
  const [result, setResult] = useState(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const [loadTestRunning, setLoadTestRunning] = useState(false);
  const [loadTestProgress, setLoadTestProgress] = useState(0);

  const [realPing, setRealPing] = useState(null);
  const [pinging, setPinging] = useState(false);

  const [detectedLocation, setDetectedLocation] = useState(null);
  const [detecting, setDetecting] = useState(false);

  useEffect(() => {
    api.getWebsites().then((res) => {
      if (res.success) {
        setWebsites(res.websites);
        if (res.websites.length > 0) setWebsiteId(res.websites[0].id);
      }
    });
  }, []);

  const sendRequest = async () => {
    if (!websiteId) {
      setError('Add a website first (Websites page) before simulating requests.');
      return;
    }
    setError('');
    setResult(null);
    setSending(true);

    setStage('routing');
    await sleep(500);

    try {
      const res = await api.simulateRequest({
        website_id: Number(websiteId),
        user_location: userLocation,
        content_path: contentPath,
        realLatencyMs: realPing?.success ? realPing.latencyMs : null,
      });

      if (!res.success) {
        setError(res.message || 'All edge servers are offline — request failed.');
        setStage(null);
        setSending(false);
        return;
      }

      setStage('cache-check');
      await sleep(500);

      if (res.cacheResult === 'HIT') {
        setStage('hit');
      } else {
        setStage('miss-origin');
      }
      await sleep(700);

      setStage('done');
      setResult(res);
    } catch (err) {
      setError(err.response?.data?.message || 'Request failed. Is the backend running?');
      setStage(null);
    } finally {
      setSending(false);
    }
  };

  const runLoadTest = async () => {
    if (!websiteId) {
      setError('Add a website first before running a load test.');
      return;
    }
    setError('');
    setLoadTestRunning(true);
    setLoadTestProgress(0);
    const total = 20;
    for (let i = 0; i < total; i++) {
      const randomLocation = USER_LOCATIONS[Math.floor(Math.random() * USER_LOCATIONS.length)];
      const randomContent = CONTENT_ITEMS[Math.floor(Math.random() * CONTENT_ITEMS.length)];
      try {
        await api.simulateRequest({
          website_id: Number(websiteId),
          user_location: randomLocation,
          content_path: randomContent,
        });
      } catch (e) {
        /* skip failed ones, keep going */
      }
      setLoadTestProgress(i + 1);
      await sleep(120);
    }
    setLoadTestRunning(false);
  };

  const runRealPing = async () => {
    setPinging(true);
    const pingResult = await measureRealLatency();
    setRealPing(pingResult);
    setPinging(false);
  };

  const detectRealLocation = async () => {
    setDetecting(true);
    try {
      const res = await api.detectLocation();
      if (res.success) {
        setDetectedLocation(res);
      } else {
        setDetectedLocation({ success: false });
      }
    } catch (err) {
      setDetectedLocation({ success: false });
    } finally {
      setDetecting(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 340px) 1fr', gap: 20, alignItems: 'start' }}>
        <div className="card">
          <h3 style={{ fontSize: 15, marginBottom: 18 }}>Simulate a Request</h3>

          <div style={{ marginBottom: 14 }}>
            <label>Website</label>
            <select value={websiteId} onChange={(e) => setWebsiteId(e.target.value)}>
              {websites.length === 0 && <option value="">No websites — add one first</option>}
              {websites.map((w) => (
                <option key={w.id} value={w.id}>{w.domain}</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label>User Location</label>
            <select value={userLocation} onChange={(e) => setUserLocation(e.target.value)}>
              {USER_LOCATIONS.map((loc) => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              style={{ marginTop: 8, width: '100%' }}
              onClick={detectRealLocation}
              disabled={detecting}
            >
              {detecting ? 'Detecting...' : '📍 Detect My Real Location'}
            </button>
            {detectedLocation && detectedLocation.success !== false && (
              <div style={{ marginTop: 8, fontSize: 12.5, color: 'var(--text-2)' }}>
                Real location: <strong>{detectedLocation.city}, {detectedLocation.country}</strong> (IP: {detectedLocation.ip})
              </div>
            )}
            {detectedLocation && detectedLocation.success === false && (
              <div style={{ marginTop: 8, fontSize: 12.5, color: 'var(--danger)' }}>
                Could not detect real location.
              </div>
            )}
          </div>

          <div style={{ marginBottom: 22 }}>
            <label>Requested Content</label>
            <select value={contentPath} onChange={(e) => setContentPath(e.target.value)}>
              {CONTENT_ITEMS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {error && (
            <div style={{ background: 'var(--danger-soft)', color: '#f87171', padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 16 }}>
              {error}
            </div>
          )}

          <button className="btn btn-primary" style={{ width: '100%' }} onClick={sendRequest} disabled={sending || loadTestRunning}>
            {sending ? <Loader2 size={16} className="spin" /> : <><Send size={15} /> Send Request</>}
          </button>

          <button
            className="btn btn-outline"
            style={{ width: '100%', marginTop: 10 }}
            onClick={runLoadTest}
            disabled={sending || loadTestRunning}
          >
            {loadTestRunning ? <Loader2 size={15} className="spin" /> : <Zap size={15} />}
            {loadTestRunning ? ` Running (${loadTestProgress}/20)...` : ' Run Load Test (20 requests)'}
          </button>
        </div>

        <div>
          <SimulatorFlow stage={stage} cacheResult={result?.cacheResult} />

          {result && (
            <div className="card fade-up" style={{ marginTop: 18 }}>
              <h3 style={{ fontSize: 15, marginBottom: 16 }}>Request Details</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, fontSize: 13.5 }}>
                <Detail label="Request ID" value={result.requestId} mono />
                <Detail label="Edge Server" value={`${result.edgeServer} (${result.edgeServerLocation})`} />
                <Detail label="Cache Result" value={result.cacheResult} />
                <Detail label="Response Time" value={`${result.responseTime} ms`} />
                <Detail label="Distance" value={`${result.routingDetail.distanceKm} km`} />
                <Detail label="Routing Score" value={result.routingDetail.finalScore} />
              </div>

              {result.realFetch && (
                <div style={{ marginTop: 18, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Real Origin Fetch (Cache MISS)
                  </div>
                                    {result.realFetch.success ? (
                    <div style={{ fontSize: 13.5, display: 'grid', gap: 6 }}>
                      <div>✅ Successfully fetched real content from <span className="mono">{result.realFetch.url}</span></div>
                      <div>HTTP Status: <strong>{result.realFetch.statusCode}</strong></div>
                      <div>Real fetch time: <strong>{result.realFetch.durationMs} ms</strong></div>
                      <div>Content size: <strong>{result.realFetch.sizeKB} KB</strong></div>
                      <div>
                        Real Cache-Control header: <span className="mono">{result.realFetch.cacheControlHeader || '(none sent)'}</span>
                      </div>
                      {result.realFetch.isNoStore ? (
                        <div style={{ color: 'var(--warning)' }}>⚠️ Origin says: do not cache this content</div>
                      ) : result.realFetch.realMaxAge !== null ? (
                        <div>Cached using real origin TTL: <strong>{result.realFetch.realMaxAge}s</strong></div>
                      ) : (
                        <div style={{ color: 'var(--text-2)' }}>No max-age specified — using configured default TTL</div>
                      )}
                    </div>
                  ) : (
                    <div style={{ fontSize: 13.5, color: 'var(--danger)' }}>
                      ⚠️ Real fetch failed: {result.realFetch.error} (URL: {result.realFetch.url})
                    </div>
                  )}
                </div>
              )}

              <div style={{ marginTop: 18, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                <div style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Routing Score Breakdown
                </div>
                <ScoreBar label="Location" value={result.routingDetail.locationScore} />
                <ScoreBar label="Latency" value={result.routingDetail.latencyScore} />
                <ScoreBar label="Load" value={result.routingDetail.loadScore} />
              </div>
            </div>
          )}

          <div className="card" style={{ marginTop: 18 }}>
            <h3 style={{ fontSize: 15, marginBottom: 6 }}>Real Latency Check</h3>
            <p style={{ fontSize: 12.5, color: 'var(--text-2)', marginBottom: 14 }}>
              Measures actual round-trip time to a real Cloudflare edge server — genuine network data, not simulated.
            </p>
            <button className="btn btn-outline btn-sm" onClick={runRealPing} disabled={pinging}>
              {pinging ? 'Pinging...' : 'Run Real Ping'}
            </button>
            {realPing && realPing.success && (
              <div className="fade-up" style={{ marginTop: 14, fontSize: 13.5 }}>
                <div><strong>{realPing.latencyMs} ms</strong> real round-trip time</div>
                <div style={{ color: 'var(--text-2)', marginTop: 4 }}>
                  Served from: {realPing.servedFrom.city}, {realPing.servedFrom.country} (Cloudflare {realPing.servedFrom.colo})
                </div>
              </div>
            )}
            {realPing && !realPing.success && (
              <div style={{ marginTop: 14, color: 'var(--danger)', fontSize: 13.5 }}>
                Ping failed: {realPing.error}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Detail({ label, value, mono }) {
  return (
    <div>
      <div style={{ fontSize: 11.5, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>{label}</div>
      <div className={mono ? 'mono' : ''} style={{ fontSize: 14, fontWeight: 600 }}>{value}</div>
    </div>
  );
}

function ScoreBar({ label, value }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 4 }}>
        <span style={{ color: 'var(--text-2)' }}>{label}</span>
        <span>{value}</span>
      </div>
      <div style={{ height: 6, borderRadius: 4, background: 'var(--surface)', overflow: 'hidden' }}>
        <div style={{ width: `${value}%`, height: '100%', background: 'var(--primary)', borderRadius: 4 }} />
      </div>
    </div>
  );
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}