import { Link } from 'react-router-dom';
import {
  ArrowRight, Globe2, Zap, Route, Database, ShieldCheck,
  Gauge, RefreshCcw, BarChart3, Lock,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import FlowVisual from '../components/FlowVisual';

const FEATURES = [
  { icon: Globe2, title: 'Global Edge Network', desc: '8 simulated edge locations across 5 continents, ready to serve content closer to your users.' },
  { icon: Route, title: 'Intelligent Routing', desc: 'A weighted scoring algorithm picks the best server by location, latency, and live load.' },
  { icon: Database, title: 'Smart Caching', desc: 'Content is cached at the edge automatically, with configurable TTL per website.' },
  { icon: Zap, title: 'Cache HIT/MISS Detection', desc: 'Every request is classified in real time, so you can see exactly what was served from cache.' },
  { icon: Gauge, title: 'Low Latency Delivery', desc: 'Response times are calculated from real distance and simulated network conditions.' },
  { icon: RefreshCcw, title: 'Failover Simulation', desc: 'Take any edge server offline and watch traffic reroute automatically.' },
  { icon: BarChart3, title: 'Real-Time Analytics', desc: 'Traffic, hit ratio, and latency trends, visualized as they happen.' },
  { icon: ShieldCheck, title: 'Origin Protection', desc: 'Caching reduces direct load on your origin server, shielding it from traffic spikes.' },
];

const STEPS = [
  { n: '01', title: 'User sends request', desc: 'A visitor requests a page or asset from your website.' },
{ n: '02', title: 'CDNexus selects best edge', desc: 'The routing engine scores every online server by location, latency, and load.' },
  { n: '03', title: 'Check edge cache', desc: 'The selected server checks whether it already has this content cached.' },
  { n: '04', title: 'HIT → instant response', desc: 'If cached and fresh, the content is returned immediately — no origin trip needed.' },
  { n: '05', title: 'MISS → ask the origin', desc: 'If not cached (or expired), the edge server fetches it from your origin server.' },
  { n: '06', title: 'Store in edge cache', desc: 'The fetched content is cached at the edge for the configured TTL.' },
  { n: '07', title: 'Deliver to user', desc: 'The response reaches the user — future requests for this content are now fast HITs.' },
];

const LOCATIONS = ['Delhi', 'Mumbai', 'Singapore', 'London', 'Frankfurt', 'New York', 'San Francisco', 'Tokyo'];

export default function Landing() {
  return (
    <div>
      <Navbar />

      {/* HERO */}
      <section className="container" style={{ paddingTop: 90, paddingBottom: 60 }}>
        <div className="fade-up" style={{ textAlign: 'center', maxWidth: 780, margin: '0 auto' }}>
                    <div className="badge" style={{ background: 'var(--primary-soft)', color: 'var(--primary)', marginBottom: 22, display: 'inline-flex' }}>
            <Globe2 size={13} /> SIMULATED CLOUD CDN
          </div>
          <h1 style={{ fontSize: 'clamp(32px, 6vw, 56px)', marginBottom: 20 }}>
           Accelerate Your Digital World with <span style={{ color: 'var(--primary)' }}>CDNexus</span>
          </h1>
          <p style={{ color: 'var(--text-1)', fontSize: 17, lineHeight: 1.6, marginBottom: 34 }}>
            Simulate intelligent content delivery across global edge servers with caching,
            routing, latency analysis, and real-time performance monitoring.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-primary">Launch Dashboard <ArrowRight size={16} /></Link>
            <a href="#network" className="btn btn-outline">Explore Network</a>
          </div>
        </div>
        <div style={{ marginTop: 60 }}><FlowVisual /></div>
      </section>

      {/* FEATURES */}
      <section id="features" className="container" style={{ paddingTop: 60, paddingBottom: 60 }}>
        <div style={{ textAlign: 'center', maxWidth: 600, margin: '0 auto 44px' }}>
          <h2 style={{ fontSize: 'clamp(26px, 4vw, 36px)', marginBottom: 14 }}>How CDNexus works</h2>
          <p style={{ color: 'var(--text-2)', fontSize: 15 }}>Every feature here mirrors how a production CDN actually behaves.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 18 }}>
          {FEATURES.map((f) => (
            <div className="card fade-up" key={f.title}>
              <div style={{
                width: 42, height: 42, borderRadius: 11, marginBottom: 16,
                background: 'var(--primary-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <f.icon size={20} color="var(--primary)" />
              </div>
              <h3 style={{ fontSize: 16, marginBottom: 8 }}>{f.title}</h3>
              <p style={{ color: 'var(--text-2)', fontSize: 13.5, lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="container" style={{ paddingTop: 60, paddingBottom: 60 }}>
        <div style={{ textAlign: 'center', maxWidth: 600, margin: '0 auto 44px' }}>
          <h2 style={{ fontSize: 'clamp(26px, 4vw, 36px)', marginBottom: 14 }}>How SmartCDN works</h2>
          <p style={{ color: 'var(--text-2)', fontSize: 15 }}>From request to response, step by step.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
          {STEPS.map((s) => (
            <div className="card" key={s.n}>
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--cyan)', fontSize: 13, fontWeight: 600 }}>{s.n}</span>
              <h3 style={{ fontSize: 15, margin: '8px 0' }}>{s.title}</h3>
              <p style={{ color: 'var(--text-2)', fontSize: 13.5, lineHeight: 1.5 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* GLOBAL NETWORK */}
      <section id="network" className="container" style={{ paddingTop: 60, paddingBottom: 60 }}>
        <div style={{ textAlign: 'center', maxWidth: 600, margin: '0 auto 44px' }}>
          <h2 style={{ fontSize: 'clamp(26px, 4vw, 36px)', marginBottom: 14 }}>8 edge locations, ready to route</h2>
          <p style={{ color: 'var(--text-2)', fontSize: 15 }}>Every location below is a live, toggleable node in your dashboard.</p>
        </div>
        <div className="card" style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center', padding: 28 }}>
          {LOCATIONS.map((loc) => (
                       <div key={loc} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 16px', borderRadius: 100,
              background: 'var(--surface)', border: '1px solid var(--border)', fontSize: 13.5,
            }}>
              <span className="dot dot-online pulse" /> {loc}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container" style={{ paddingTop: 40, paddingBottom: 80 }}>
               <div className="card" style={{
          textAlign: 'center', padding: '60px 30px',
          background: 'linear-gradient(135deg, rgba(37,99,235,0.06), rgba(249,115,22,0.04))',
        }}>
          <h2 style={{ fontSize: 'clamp(24px, 4vw, 34px)', marginBottom: 16 }}>
            Ready to Experience Content Delivery at the Edge?
          </h2>
          <Link to="/register" className="btn btn-primary" style={{ marginTop: 10 }}>
            Open CDNexus Dashboard <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}