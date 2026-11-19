-- ============================================================
-- SmartCDN Database Schema
-- Run this entire file to create the database and all tables.
-- ============================================================

-- ---------- users ----------
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,       -- stores the bcrypt HASH, never plain text
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ---------- websites ----------
CREATE TABLE IF NOT EXISTS websites (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  domain VARCHAR(150) NOT NULL,
  origin_server VARCHAR(150) NOT NULL,
  protocol VARCHAR(10) DEFAULT 'HTTPS',
  cache_ttl INT DEFAULT 3600,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ---------- edge_servers ----------
CREATE TABLE IF NOT EXISTS edge_servers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  location VARCHAR(100) NOT NULL,
  region VARCHAR(100) NOT NULL,
  ip_address VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'online',   -- online | offline | maintenance
  cpu_usage INT DEFAULT 0,
  memory_usage INT DEFAULT 0,
  current_requests INT DEFAULT 0,
  latency INT DEFAULT 10,
  lat DECIMAL(9,6),
  lng DECIMAL(9,6)
);

-- ---------- cache_entries ----------
CREATE TABLE IF NOT EXISTS cache_entries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  website_id INT NOT NULL,
  edge_server_id INT NOT NULL,
  content_path VARCHAR(255) NOT NULL,
  cache_status VARCHAR(10) DEFAULT 'HIT',
  ttl INT DEFAULT 3600,
  size INT DEFAULT 0,                    -- in KB
  last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (website_id) REFERENCES websites(id) ON DELETE CASCADE,
  FOREIGN KEY (edge_server_id) REFERENCES edge_servers(id) ON DELETE CASCADE
);

-- ---------- request_logs ----------
CREATE TABLE IF NOT EXISTS request_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  request_id VARCHAR(30) NOT NULL,
  website_id INT,
  user_location VARCHAR(100),
  edge_server_id INT,
  content_path VARCHAR(255),
  cache_result VARCHAR(10),              -- HIT | MISS
  response_time INT,                     -- in ms
  status VARCHAR(20) DEFAULT 'success',  -- success | error
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (website_id) REFERENCES websites(id) ON DELETE SET NULL,
  FOREIGN KEY (edge_server_id) REFERENCES edge_servers(id) ON DELETE SET NULL
);

-- ---------- user_settings ----------
CREATE TABLE IF NOT EXISTS user_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  default_cache_ttl INT DEFAULT 3600,
  routing_mode VARCHAR(30) DEFAULT 'smart',   -- smart | lowest_latency | lowest_load
  cache_enabled BOOLEAN DEFAULT TRUE,
  failover_enabled BOOLEAN DEFAULT TRUE,
  analytics_enabled BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================
-- Seed data: 8 edge servers across real-world CDN-style locations
-- ============================================================
INSERT INTO edge_servers (name, location, region, ip_address, status, cpu_usage, memory_usage, current_requests, latency, lat, lng) VALUES
('EDGE-DEL-01', 'Delhi', 'India', '10.20.11.101', 'online', 34, 41, 210, 12, 28.6139, 77.2090),
('EDGE-MUM-01', 'Mumbai', 'India', '10.21.12.102', 'online', 28, 38, 180, 11, 19.0760, 72.8777),
('EDGE-SIN-01', 'Singapore', 'Singapore', '10.22.13.103', 'online', 45, 52, 320, 9, 1.3521, 103.8198),
('EDGE-LON-01', 'London', 'UK', '10.23.14.104', 'online', 39, 44, 260, 10, 51.5074, -0.1278),
('EDGE-FRA-01', 'Frankfurt', 'Germany', '10.24.15.105', 'online', 31, 36, 190, 8, 50.1109, 8.6821),
('EDGE-NYC-01', 'New York', 'USA', '10.25.16.106', 'online', 52, 58, 410, 14, 40.7128, -74.0060),
('EDGE-SFO-01', 'San Francisco', 'USA', '10.26.17.107', 'online', 27, 33, 150, 13, 37.7749, -122.4194),
('EDGE-TYO-01', 'Tokyo', 'Japan', '10.27.18.108', 'online', 36, 40, 230, 9, 35.6762, 139.6503);
