# CDNexus — Cloud Content Delivery Network Platform

**Delivering Content Faster, Smarter, Everywhere.**

CDNexus is a full-stack web application that models how a real Content Delivery Network (CDN) works — intelligent edge routing, caching with HIT/MISS detection, automatic failover, DNS management, WAF-style security, and real-time analytics. It is a hybrid system: the core routing/caching engine and the 8 edge server *locations* are simulated (since real global infrastructure requires ongoing paid hosting), but a substantial set of surrounding features perform **genuine, real-world operations** — real DNS lookups, real content fetching, real SSL inspection, real security auditing, and more, detailed below.

> **Honesty note for evaluators:** CDNexus does not operate physical servers in 8 real countries — that would require continuous paid infrastructure. What it does do, genuinely: validate real domains via DNS, fetch real content from real websites, respect real HTTP caching headers, measure real network latency to a live Cloudflare edge, detect a user's real IP-based location, inspect real SSL certificates, enforce a real WAF block on a live public endpoint, check real origin uptime, audit real HTTP security headers, and check real password breach databases. Each "real" claim in this document refers to a genuine network operation or genuine data source — not a simulated approximation.

---

## Features

### Core CDN Simulation
- **Authentication** — JWT-based register/login, bcrypt password hashing, protected routes, row-level data isolation between accounts
- **Website Management** — register domains with origin server, protocol, and cache TTL
- **Edge Network** — 8 simulated global edge locations (Delhi, Mumbai, Singapore, London, Frankfurt, New York, San Francisco, Tokyo) with live CPU/memory/latency stats, manual Online/Offline/Maintenance toggling, plotted on a real interactive Mappls map (India's own mapping platform) using each server's real-world coordinates
- **Intelligent Routing Engine** — a weighted scoring algorithm (Location 50% + Latency 30% + Load 20%) selects the best available edge server per request; supports Smart / Lowest Latency / Lowest Load modes
- **Automatic Failover** — offline servers are automatically excluded from routing; traffic reroutes to the next-best server with zero manual intervention
- **Cache Simulation** — HIT/MISS logic backed by MySQL, with TTL expiry, per-server cache inspection, and manual clear/delete
- **Request Simulator** — animated end-to-end visualization of a request traveling User → Edge Server → Cache → Origin Server, with a full routing-score breakdown, plus a bulk "Load Test" mode (20 randomized requests)
- **Analytics & Traffic Logs** — request history, cache hit ratio, traffic by region, response time trends, paginated searchable logs, CSV export
- **Settings** — per-user CDN preferences (routing mode, cache/failover/analytics toggles, default TTL) that genuinely affect simulator behavior

### Cloudflare-Style Extensions
- **DNS Management** — per-website DNS records (A, CNAME, TXT, MX) with a Cloudflare-style "Proxied" (orange cloud) vs. "DNS only" (grey cloud) toggle
- **Security Rules (WAF-style)** — configurable per-website firewall rules that block simulated traffic by location; blocked requests are rejected before reaching the routing engine, and logged to a dedicated Firewall Events view

### Real-Data Integrations
These features perform genuine network operations against real, live external systems — not simulated data:

| Feature | What it genuinely does |
|---|---|
| **Real domain validation** | Performs an actual DNS lookup (`dns.lookup`) before allowing a website to be registered — rejects domains that don't resolve |
| **Real content fetching** | On a cache MISS, genuinely sends an HTTP request to the website's real domain and fetches real content, with a real 5-second timeout |
| **Real cache-control respect** | Reads the actual `Cache-Control` header the real website returns and uses its real `max-age` as the effective TTL, honoring `no-store`/`no-cache` directives |
| **Real latency measurement** | Pings a live, publicly deployed Cloudflare Worker and measures genuine round-trip time; this real value is blended into the routing algorithm's Latency Score |
| **Real IP geolocation** | Detects the user's actual city/country/IP via a live geolocation lookup, as an alternative to manually selecting a location |
| **Real SSL certificate monitoring** | Opens a genuine TLS handshake with a website's real HTTPS port and reads its actual live certificate — real issuer, real expiry date, real days remaining |
| **Real WAF enforcement** | A live, publicly deployed Cloudflare Worker performs genuine country-based blocking using Cloudflare's real request geolocation data, returning a real HTTP 403 |
| **Real origin health checks** | Sends a real HTTP HEAD request to a website's actual origin to determine genuine up/down status and real response time |
| **Real backend system stats** | Reads genuine OS-level data (via Node's `os` module) from the actual machine running the server — real memory usage, real CPU core count, real process uptime |
| **Real security headers audit** | Inspects a website's actual HTTP response headers (HSTS, CSP, X-Frame-Options, etc.) and computes a real weighted score, the same approach tools like securityheaders.com use |
| **Real password breach check** | Uses the HaveIBeenPwned API (k-anonymity model — only a hash prefix is ever sent, never the password) to check a chosen password against real known data breaches during registration |

### Engineering / DevOps
- **Rate Limiting** — the request simulation API is rate-limited server-side to prevent abuse
- **Dark/Light Theme** — a real, working theme toggle, persisted across sessions
- **Dockerized** — the full stack (frontend, backend, MySQL) runs via a single `docker-compose up` command
- **Mock Email Service** — demonstrates a transactional email integration point (welcome email on registration), logged to the server console

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 (Vite), React Router, Recharts, Mappls (India's mapping platform), Lucide Icons, Axios |
| Backend | Node.js, Express.js |
| Database | MySQL |
| Auth | JWT (jsonwebtoken), bcrypt |
| Real-data integrations | Native `fetch`, Node `dns`, Node `tls`, Node `os`, Cloudflare Workers, HaveIBeenPwned API, ip-api.com |
| DevOps | Docker, Docker Compose |

---

## Project Structure

```
cdnexus/
├── frontend/                 # React + Vite application
│   └── src/
│       ├── components/       # Sidebar, Navbar, Footer, WorldMap (Mappls), shared UI
│       ├── pages/             # Landing, Login, Register, NotFound
│       │   └── dashboard/     # Overview, Websites, EdgeNetwork, Simulator,
│       │                      # CacheManager, TrafficLogs, Analytics, Settings,
│       │                      # DnsRecords, Security
│       ├── context/           # AuthContext (login state, JWT persistence)
│       ├── utils/             # realLatency.js, realWaf.js — real external calls
│       └── services/          # api.js — centralized backend API client
│
├── backend/                   # Node.js + Express API
│   ├── config/db.js           # MySQL connection pool
│   ├── controllers/           # Business logic per resource
│   ├── routes/                # Express route definitions
│   ├── middleware/            # JWT auth, rate limiter
│   ├── utils/                 # Routing engine, location data, mock email,
│   │                          # sslChecker, healthChecker, systemStats,
│   │                          # securityHeaders
│   └── server.js
│
├── database/
│   └── smartcdn.sql            # Full schema + seed data (8 edge servers)
│
├── docker-compose.yml
└── README.md
```

---

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org) v18+ (native `fetch` support required for real-data features)
- MySQL (via [XAMPP](https://www.apachefriends.org) or standalone)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) — optional, for containerized deployment

### 1. Set up the database

Start MySQL, open phpMyAdmin, and run the full contents of `database/smartcdn.sql`. This creates the database, all tables, and seeds 8 edge servers with real-world coordinates.

### 2. Set up the backend

```bash
cd backend
npm install
```

Create `backend/.env`:
```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=smartcdn
JWT_SECRET=your_own_secret_key
```

```bash
npm run dev
```

### 3. Set up the frontend

```bash
cd frontend
npm install
npm run dev
```

### 4. Use it

Register an account (your password is checked against real breach data), log in, add a real reachable website (e.g., `wikipedia.org`) under **Websites**, then use the **Request Simulator** to see real content fetching in action, and check the **Security** page for real WAF testing and a real header audit.

---

## The Routing Algorithm

```
Routing Score = LocationScore × 0.5 + LatencyScore × 0.3 + LoadScore × 0.2
```

- **LocationScore** — haversine (great-circle) distance between the user and each edge server
- **LatencyScore** — a simulated base reading, blended with real measured Cloudflare edge latency when available
- **LoadScore** — simulated CPU/request load per edge server

Only **online** servers are ever scored, which produces automatic failover without special-case code. If every server is offline, the system returns an explicit error.

## Security Architecture

Security rules are checked **before** routing or caching — a blocked request never reaches the routing engine, mirroring how a real WAF sits in front of a CDN's request pipeline. This is demonstrated two ways: internally (simulated requests checked against stored rules) and externally (a real, live Cloudflare Worker genuinely enforcing country-based blocking with real HTTP 403 responses).

---

## Database Schema

Nine tables: `users`, `websites`, `edge_servers`, `cache_entries`, `request_logs`, `user_settings`, `dns_records`, `security_rules`, `firewall_events`. Every resource table enforces ownership at the query level, including through join chains for DNS and security records.

---

## Honest Limitations

- Edge server *locations* are simulated — real global servers require ongoing paid hosting
- Edge server CPU/memory stats are simulated with realistic jitter — tied to simulated servers
- DNS records are stored and displayed but do not propagate to real DNS infrastructure (would require owning a real domain and real DNS authority)
- The Load Score component of routing remains simulated — a single real backend machine can't represent 8 distinct real locations' load
- Internal security rules block simulated traffic only; the separate live Cloudflare Worker demonstrates real enforcement but is a standalone endpoint, not integrated into the main routing pipeline

---

## Author

Built as a college project to demonstrate full-stack development, core CDN/edge-network concepts, and genuine integration with real-world network protocols and services where practically achievable within a free/open-source budget.

© 2026 CDNexus — not affiliated with any commercial CDN provider.