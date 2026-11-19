import { Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';
import Overview from './pages/dashboard/Overview';
import Websites from './pages/dashboard/Websites';
import DnsRecords from './pages/dashboard/DnsRecords';
import Security from './pages/dashboard/Security';
import EdgeNetwork from './pages/dashboard/EdgeNetwork';
import Simulator from './pages/dashboard/Simulator';
import CacheManager from './pages/dashboard/CacheManager';
import TrafficLogs from './pages/dashboard/TrafficLogs';
import Analytics from './pages/dashboard/Analytics';
import Settings from './pages/dashboard/Settings';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Overview />} />
        <Route path="websites" element={<Websites />} />
                <Route path="websites/:websiteId/dns" element={<DnsRecords />} />
                <Route path="websites/:websiteId/security" element={<Security />} />
        <Route path="edge-network" element={<EdgeNetwork />} />
        <Route path="simulator" element={<Simulator />} />
        <Route path="cache" element={<CacheManager />} />
        <Route path="logs" element={<TrafficLogs />} />
        <Route path="analytics" element={<Analytics />} />
       <Route path="settings" element={<Settings />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}