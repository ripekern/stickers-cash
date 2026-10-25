-- Per-order BCH addresses for stickers.cash
--
-- next_index is the next receive index to hand out under the account xpub.
-- It starts at 1 because index 0 is normally the address already published on
-- the site (m/44'/145'/0'/0/0). If your wallet has already used further
-- indices, bump this to (highest used index + 1) BEFORE the first real sale.
--
-- Keep this counter dense: Selene only discovers addresses up to the gap limit
-- beyond the last used index. If more than ~20 quotes go unpaid in a row, open
-- Selene's Address Scan Tool and scan a range that covers the new indices.

CREATE TABLE IF NOT EXISTS counter (
  id         INTEGER PRIMARY KEY CHECK (id = 1),
  next_index INTEGER NOT NULL
);

INSERT OR IGNORE INTO counter (id, next_index) VALUES (1, 1);

CREATE TABLE IF NOT EXISTS orders (
  order_id   TEXT PRIMARY KEY,
  hd_index   INTEGER NOT NULL UNIQUE,
  address    TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
