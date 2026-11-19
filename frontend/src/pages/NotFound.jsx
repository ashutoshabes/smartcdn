import { Link } from 'react-router-dom';
import { Network } from 'lucide-react';

export default function NotFound() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 20 }}>
      <Network size={40} color="var(--text-3)" style={{ marginBottom: 18 }} />
      <h1 style={{ fontSize: 60, marginBottom: 10 }}>404</h1>
      <p style={{ color: 'var(--text-2)', marginBottom: 24 }}>This route doesn't exist in CDNexus.</p>
      <Link to="/" className="btn btn-primary">Back to Home</Link>
    </div>
  );
}