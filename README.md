# stickers.cash

A static storefront for selling vinyl stickers worldwide, paid **only in Bitcoin Cash (BCH)**.

**Live site:** https://stickers.cash/

## The site

- `index.html` — storefront (hero, product grid, how-it-works, shipping, FAQ, footer)
- `blog.html` — blog index: hero plus card grid for the thirty-part internet cash guide.
  Chapter one (posts 1–10) is built from `why-bitcoin-is-like-cash.md` +
  `teachBitcoinCash.md`; chapter two (posts 11–20) is the practical BCH handbook;
  chapter three (posts 21–30) covers BCH programmability, CashTokens, covenants, and apps.
- `blog/` — one static page per post, with previous/next navigation
- `blog.js` — mobile nav + copy-address toast for the blog pages
- `styles.css` — all styling (brand: BCH green `#0AC18E`, dark `#0F1820`, Ubuntu font;
  blog cards and post layout live in the long-form section)
- `app.js` — catalog, cart (localStorage), checkout, BCH quotes, QR, order flow
- `worker/` — optional Cloudflare Worker: per-order BCH addresses from an xpub
- `stickers/` — the 9 sticker designs as die-cut SVGs (the product art)
- `media/` — official BCH graphics, character art, payment QR (see `media/README.md`)
- `trifold.html` — the original print trifold (kept as-is)

### Products & options

9 single designs + 3 bundles. Singles offer size (**3″ / 4″ / 6″**, +$1 / +$3),
finish (**matte / glossy**) and quantity.
Automatic bundle savings: 3–4 stickers −5%, 5–9 −10%, 10+ −15%.

| Shipping | Rate | Free over | Time |
|---|---|---|---|
| 🇺🇸 United States | $2 | $25 | 3–7 business days |
| 🌍 International | $6 | $50 | 7–21 business days |

### Payment (BCH only)

- Payments: via cart checkout. Each order gets its own address from the Worker;
  if the Worker is unreachable, checkout falls back to the published address
  `bitcoincash:qqmgqc33anq340gsy6mfrf5c0c9rhf7805xwns52am` (index 0 of the same
  xpub, so both paths land in the same wallet).
- Checkout converts the USD total to an exact BCH amount, rate locked 15 minutes.
- Rate source: CoinGecko (`app.js` → `fetchRate()`), with baked-in fallback
  `FALLBACK_RATE` if the API is unreachable — update that constant occasionally.
- QR: generated per order via qrserver, embedding the order's address and
  `?amount=`. If qrserver is down the QR is hidden (no static fallback, since a
  static code would point at a different address).

### Per-order addresses (optional)

With `PAY_API` set in `app.js` (currently
`https://stickers-cash-pay.stickers-cash-pay.workers.dev`), checkout asks the
`worker/` API for a fresh address derived from an account xpub
(`m/44'/145'/0'/0/<index>`). Every order gets its own address, and the receipt
email includes the address index. Details and deployment steps:
`worker/README.md`.

If the API is unreachable, checkout silently falls back to `BCH_ADDRESS`
(index 0), so the store keeps working.

Never commit the xpub. It lives in `wrangler secret` (production) or
`worker/.dev.vars` (local, gitignored). An xpub is watch-only — it can derive
addresses but cannot move funds. Still, treat it as private: it reveals every
address and balance in that account.

### Order flow (no backend required)

1. Customer checks out client-side and is shown the exact BCH amount + QR.
2. They click "I've sent the payment" → order ID (`STK-XXXXXXXX`) + prefilled
   receipt email to `orders@stickers.cash`, including every cart line (product,
   size, finish, qty, line total) plus the subtotal/discount/shipping breakdown.
3. You match the payment against your wallet and ship.

Change `STORE_EMAIL` in `app.js` if the inbox differs. The Worker only issues
addresses; it does not detect payments. Payment status is still matched in your
wallet (or by address, which is now unambiguous).

## Editing

- **Prices/products:** the `PRODUCTS` array at the top of `app.js`.
- **Shipping rates/thresholds:** the `SHIP` object in `app.js` (+ copy in `index.html`).
- **Countries list:** `COUNTRIES` in `app.js`.
- **New sticker design:** drop an SVG in `stickers/` (600×600-ish, transparent
  background, white kiss-cut border built in), then add a product entry.
- **Blog:** the index and every post are plain HTML. Add a new post in `blog/`, then add a
  matching card to `blog.html` and update the previous post's "next" link. `blog.js` handles
  the mobile menu and copy-address toast. The markdown files are chapter-one source drafts, not
  loaded at runtime; chapters two and three live in the static post pages.

## Run locally

```sh
python3 -m http.server 8765 --bind ::
# open http://localhost:8765/
```

## Deploy

It's a fully static site — **GitHub Pages**: https://github.com/ripekern/stickers-cash

Push to `main` and Pages rebuilds automatically:

```sh
git add -A && git commit -m "Update store" && git push
```

- Live site: **https://stickers.cash** (custom domain via `CNAME`, HTTP→HTTPS enforced)
- `www.stickers.cash` redirects to the apex; cert is auto-renewed by GitHub

All artwork: official BCH graphics (promo use allowed) and Open Peeps (CC0) — see `media/README.md`.
