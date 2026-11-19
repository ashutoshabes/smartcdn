import { useEffect, useRef } from 'react';

const STATUS_COLOR = {
  online: '#16A34A',
  offline: '#DC2626',
  maintenance: '#F59E0B',
};

export default function WorldMap({ servers }) {
  const containerId = 'mappls-edge-map';
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  const validServers = servers.filter((s) => s.lat && s.lng);

  useEffect(() => {
    let cancelled = false;

    function tryInit() {
      if (cancelled) return;
      if (!window.mappls || typeof window.mappls.Map !== 'function') {
        setTimeout(tryInit, 300);
        return;
      }
      if (mapInstanceRef.current) return; // already initialized

      mapInstanceRef.current = new window.mappls.Map(containerId, {
        center: [22.9734, 78.6569], // India-centered default view
        zoom: 2,
      });
    }

    tryInit();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    function placeMarkers() {
      if (!mapInstanceRef.current || !window.mappls) {
        setTimeout(placeMarkers, 300);
        return;
      }

      // Remove old markers first
      markersRef.current.forEach((m) => {
        if (m && m.remove) m.remove();
      });
      markersRef.current = [];

      validServers.forEach((s) => {
        const color = STATUS_COLOR[s.status] || '#6B7280';
        const marker = new window.mappls.Marker({
          map: mapInstanceRef.current,
          position: { lat: s.lat, lng: s.lng },
          icon: `data:image/svg+xml;utf8,${encodeURIComponent(
            `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"><circle cx="12" cy="12" r="9" fill="${color}" stroke="white" stroke-width="2.5"/></svg>`
          )}`,
          popupHtml: `
            <div style="font-family:Inter,sans-serif;font-size:13px;line-height:1.6;">
              <strong>${s.name}</strong><br/>
              ${s.location}, ${s.region}<br/>
              IP: ${s.ip_address}<br/>
              Status: <strong style="text-transform:capitalize">${s.status}</strong><br/>
              CPU: ${s.cpu_usage}% &middot; Latency: ${s.latency}ms
            </div>
          `,
        });
        markersRef.current.push(marker);
      });
    }

    placeMarkers();
  }, [servers]);

  return (
    <div className="card" style={{ padding: 0, marginBottom: 18, overflow: 'hidden' }}>
      <div style={{ padding: '16px 20px 0' }}>
        <h3 style={{ fontSize: 15, marginBottom: 4 }}>Global Edge Network</h3>
        <p style={{ fontSize: 12.5, color: 'var(--text-2)', marginBottom: 14 }}>
          Powered by Mappls — India's own mapping platform. Click a marker for live server details.
        </p>
      </div>
      <div id={containerId} style={{ height: 380, width: '100%' }} />
    </div>
  );
}