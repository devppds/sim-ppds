-- Drop and recreate spp_config table to match Hono worker code
DROP TABLE IF EXISTS spp_config;
CREATE TABLE spp_config (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  status         TEXT NOT NULL,
  kelas_name     TEXT NOT NULL,
  madrasah       TEXT NOT NULL,
  period_name    TEXT NOT NULL,
  amount         INTEGER NOT NULL DEFAULT 0,
  description    TEXT,
  created_at     TEXT DEFAULT (datetime('now')),
  updated_at     TEXT DEFAULT (datetime('now'))
);

-- Seed default SPP config values
INSERT INTO spp_config (status, kelas_name, madrasah, period_name, amount, description) VALUES
('Biasa', 'Ibtida'' 1', 'MHM', 'Bulanan', 350000, 'SPP Bulanan Kelas Ibtida'' MHM'),
('Biasa', 'Tsanawiyyah 1', 'MHM', 'Bulanan', 450000, 'SPP Bulanan Kelas Tsanawiyyah MHM'),
('Biasa', 'Aliyyah 1', 'MHM', 'Bulanan', 550000, 'SPP Bulanan Kelas Aliyyah MHM'),
('Baru', 'Ibtida'' 1', 'MHM', 'Bulanan', 400000, 'SPP Bulanan Kelas Ibtida'' Baru MHM');

-- Drop and recreate transactions table to match Hono worker code
DROP TABLE IF EXISTS transactions;
CREATE TABLE transactions (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  santri_id     INTEGER REFERENCES santri(id) ON DELETE SET NULL,
  type          TEXT NOT NULL,
  category      TEXT NOT NULL,
  amount        INTEGER NOT NULL DEFAULT 0,
  description   TEXT,
  date          TEXT,
  proof_url     TEXT,
  created_at    TEXT DEFAULT (datetime('now')),
  updated_at    TEXT DEFAULT (datetime('now')),
  deleted_at    TEXT
);

-- Drop and recreate arsip table to match Hono worker code
DROP TABLE IF EXISTS arsip;
CREATE TABLE arsip (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  name            TEXT NOT NULL,
  url             TEXT NOT NULL,
  type            TEXT,
  size            TEXT,
  category        TEXT,
  doc_date        TEXT,
  doc_number      TEXT,
  flow_type       TEXT,
  sender_receiver TEXT,
  created_at      TEXT DEFAULT (datetime('now'))
);
