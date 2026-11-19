import axios from 'axios';

// Set VITE_API_URL in the deployment environment.
// Local development falls back to the local Express API.
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const client = axios.create({
  baseURL: API_BASE,
});

// Before every request, automatically attach the saved JWT token
// (if we have one) as an Authorization header. This means every
// page that calls a protected route doesn't need to think about
// tokens at all — it's handled in one place.
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('smartcdn_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If the backend ever responds with 401 (token invalid/expired),
// automatically log the user out and send them to /login.
client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response && err.response.status === 401) {
      localStorage.removeItem('smartcdn_token');
      localStorage.removeItem('smartcdn_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const api = {
  // ---- Auth ----
  register: (data) => client.post('/auth/register', data).then((r) => r.data),
  login: (data) => client.post('/auth/login', data).then((r) => r.data),
  getProfile: () => client.get('/auth/profile').then((r) => r.data),
  changePassword: (data) => client.put('/auth/change-password', data).then((r) => r.data),
  // ---- Websites ----
   // ---- Websites ----
  getWebsites: () => client.get('/websites').then((r) => r.data),
  addWebsite: (data) => client.post('/websites', data).then((r) => r.data),
  updateWebsite: (id, data) => client.put(`/websites/${id}`, data).then((r) => r.data),
  deleteWebsite: (id) => client.delete(`/websites/${id}`).then((r) => r.data),
  checkWebsiteHealth: (id) => client.get(`/websites/${id}/health`).then((r) => r.data),
  // ---- DNS Records ----
  getDnsRecords: (websiteId) => client.get(`/dns/${websiteId}`).then((r) => r.data),
  addDnsRecord: (websiteId, data) => client.post(`/dns/${websiteId}`, data).then((r) => r.data),
  updateDnsRecord: (id, data) => client.put(`/dns/record/${id}`, data).then((r) => r.data),
  deleteDnsRecord: (id) => client.delete(`/dns/record/${id}`).then((r) => r.data),
  
  
  // ---- Security Rules ----
  getSecurityRules: (websiteId) => client.get(`/security/${websiteId}/rules`).then((r) => r.data),
  addSecurityRule: (websiteId, data) => client.post(`/security/${websiteId}/rules`, data).then((r) => r.data),
  toggleSecurityRule: (id) => client.put(`/security/rules/${id}/toggle`).then((r) => r.data),
  deleteSecurityRule: (id) => client.delete(`/security/rules/${id}`).then((r) => r.data),
  getSecurityEvents: (websiteId) => client.get(`/security/${websiteId}/events`).then((r) => r.data),
    getSecurityHeadersAudit: (websiteId) => client.get(`/security/${websiteId}/headers-audit`).then((r) => r.data),
  // ---- Edge Servers ----
  getEdgeServers: () => client.get('/edges').then((r) => r.data),
  addEdgeServer: (data) => client.post('/edges', data).then((r) => r.data),
  updateEdgeServer: (id, data) => client.put(`/edges/${id}`, data).then((r) => r.data),
  updateEdgeStatus: (id, status) => client.put(`/edges/${id}/status`, { status }).then((r) => r.data),

  // ---- Request Simulator ----
    // ---- Request Simulator ----
  simulateRequest: (data) => client.post('/simulate/request', data).then((r) => r.data),
  detectLocation: () => client.get('/simulate/detect-location').then((r) => r.data),

  // ---- Cache ----
  getCache: () => client.get('/cache').then((r) => r.data),
  deleteCacheEntry: (id) => client.delete(`/cache/${id}`).then((r) => r.data),
  clearCache: () => client.delete('/cache/clear').then((r) => r.data),

  // ---- Logs ----
  getLogs: (page = 1, limit = 20) => client.get(`/logs?page=${page}&limit=${limit}`).then((r) => r.data),

    // ---- Analytics ----
  getOverview: () => client.get('/analytics/overview').then((r) => r.data),
  getTraffic: () => client.get('/analytics/traffic').then((r) => r.data),
  getPerformance: () => client.get('/analytics/performance').then((r) => r.data),
  getRealSystem: () => client.get('/analytics/real-system').then((r) => r.data),
  // ---- Settings ----
  getSettings: () => client.get('/settings').then((r) => r.data),
  updateSettings: (data) => client.put('/settings', data).then((r) => r.data),
};