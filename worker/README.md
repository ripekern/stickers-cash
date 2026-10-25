# stickers-cash-pay

Cloudflare Worker that hands out a fresh Bitcoin Cash address per order, derived
from an account-level xpub.

```
POST /address  { "orderId": "STK-AB12CD34" }
  -> { "index": 12, "address": "bitcoincash:q..." }

GET /health
  -> { "ok": true, "xpubConfigured": true }
```

- Idempotent per `orderId`: reloads and retries reuse the same address.
- The counter in D1 is incremented atomically, so concurrent checkouts can
  never receive the same index.
- The xpub is a **watch-only** key. The worker can derive addresses but cannot
  spend. It still must stay private: it reveals every address and balance in
  the account.
- No payment detection. You still match incoming payments in your wallet —
  but now each order has its own address, so the match is unambiguous.

## 1. Create the database

```sh
cd worker
npm install
npx wrangler login
npx wrangler d1 create stickers-cash-pay
```

Paste the returned `database_id` into `wrangler.toml`, then:

```sh
npm run db:remote
```

## 2. Add the xpub

In Selene: **Settings → your wallet → Additional wallet info → xPub**.
Copy the value that starts with `xpub`. It must be at `m/44'/145'/0'`
(depth 3) — Selene's default. The worker rejects `xprv`, `tpub`, `ypub`,
`zpub`, and xpubs at other depths.

```sh
npx wrangler secret put XPUB --config wrangler.toml
```

Never commit it and never paste it into a chat. To verify it locally, put it in
`.dev.vars` instead.

## 3. Choose the starting index

`schema.sql` starts the counter at **1**, assuming index 0 is the address
already published on the site. Before the first real sale, check:

```sh
set -a; . .dev.vars; set +a
npm run address -- 0 5
```

If your published address matches index 0 and you have only ever received
there, the default is correct. If you have used further indices, set
`next_index` to the highest used index + 1:

```sh
npx wrangler d1 execute stickers-cash-pay --remote --config wrangler.toml \
  --command "UPDATE counter SET next_index = 42 WHERE id = 1"
```

## 4. Deploy

```sh
npm run deploy
curl https://stickers-cash-pay.stickers-cash-pay.workers.dev/health
```

That workers.dev URL is already set in `PAY_API` at the top of `app.js`:

```js
const PAY_API = 'https://stickers-cash-pay.stickers-cash-pay.workers.dev';
```

Commit and push. Checkout now requests an address per order; if the API is
unreachable it falls back to `BCH_ADDRESS` (index 0), so the store keeps
working.

The Worker is published on workers.dev because the storefront is on GitHub
Pages and the `stickers.cash` DNS zone is not managed by Cloudflare. Do not add
a `[[routes]]` block for `stickers-cash-pay.stickers.cash` unless the zone is
moved to Cloudflare — the deploy will fail with "Could not find zone".

## Local development

```sh
cp .dev.vars.example .dev.vars     # paste a TEST xpub, not the live one
npm run db:local
npm run dev                        # http://localhost:8787
```

Then serve the storefront in another terminal:

```sh
python3 -m http.server 8765 --bind ::
```

and set `PAY_API = 'http://localhost:8787'` temporarily. The allowed origins
already include `http://localhost:8765`.

Local D1 state lives in `.wrangler/state` and is disposable. It is not a backup
of the production counter.

## Selene and the gap limit

Selene discovers addresses sequentially and keeps **20 unused** ones ahead
(`ADDRESS_GAP_LIMIT = 20`). That has two consequences:

1. If more than ~20 quotes are issued without a payment, later indices fall
   outside the scanned range. Open **Settings → Address Scan Tool** in Selene
   and scan a range covering the new indices (or rebuild the wallet).
2. An address beyond that range will not appear, and Selene cannot spend from
   it, until it has scanned the index.

Keeping the counter dense (do not jump around, do not reset it) avoids this in
normal use. Abandoned checkouts are the main source of gaps.

The endpoint is public, so a spammer could burn indices with random order IDs.
Add a Cloudflare rate-limit rule (Security → WAF → Rate limiting rules) for
`POST /address`, e.g. 30 requests per minute per IP. The cost of spamming is
only skipped indices, not funds — but it does create gaps.

If you reset or lose the D1 counter, addresses will be reissued. Back up the
`counter` and `orders` tables before any migration.

## Files

- `src/index.js` — routes, CORS, allocation logic
- `src/derive.js` — xpub validation and `m/44'/145'/0'/0/<index>` derivation
- `schema.sql` — `counter` and `orders` tables
- `scripts/address.mjs` — print derived addresses for verification
- `test/derive.test.mjs` — vector test against Selene's published BIP44 fixture
