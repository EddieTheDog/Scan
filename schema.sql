CREATE TABLE checkins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  qr_value TEXT UNIQUE,
  name TEXT,
  seat TEXT,
  status TEXT,
  scanned_at TEXT,
  approved_at TEXT
);
