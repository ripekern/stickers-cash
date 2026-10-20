# stickers.cash

A static storefront for selling vinyl stickers worldwide, paid **only in Bitcoin Cash (BCH)**.

**Live site:** https://stickers.cash/

## The store

- `index.html` — storefront (hero, product grid, how-it-works, shipping, FAQ, footer)
- `styles.css` — all styling (brand: BCH green `#0AC18E`, dark `#0F1820`, Ubuntu font)
- `app.js` — catalog, cart (localStorage), checkout, BCH quotes, QR, order flow
- `stickers/` — the 9 sticker designs as die-cut SVGs (the product art)
- `media/` — official BCH graphics, character art, payment QR (see `media/README.md`)
- `trifold.html` — the original print trifold (kept as-is)

### Products & options

9 single designs + 3 bundles. Singles offer size (**3″ / 4″ / 6″**, +$1 / +$3),
finish (**matte / glossy / transparent**, transparent +$0.50) and quantity.
Automatic bundle savings: 3–4 stickers −5%, 5–9 −10%, 10+ −15%.

| Shipping | Rate | Free over | Time |
|---|---|---|---|
| 🇺🇸 United States | $2 | $25 | 3–7 business days |
| 🌍 International | $6 | $50 | 7–21 business days |

### Payment (BCH only)

- Address: `bitcoincash:qzfa0g4gqwz5srx3vgjjmk40gta54nzwtvkrdkt5zh`
- Checkout converts the USD total to an exact BCH amount, rate locked 15 minutes.
- Rate source: CoinGecko (`app.js` → `fetchRate()`), with baked-in fallback
  `FALLBACK_RATE` if the API is unreachable — update that constant occasionally.
- QR: dynamic (embeds `?amount=`) via qrserver, falls back to the static
  `media/bch/pay-qr.svg` if offline. Regenerate the static QR with:

```sh
qrencode -t SVG -o media/bch/pay-qr.svg 'bitcoincash:qzfa0g4gqwz5srx3vgjjmk40gta54nzwtvkrdkt5zh'
```

### Order flow (no backend)

1. Customer checks out client-side and is shown the exact BCH amount + QR.
2. They click "I've sent the payment" → order ID (`STK-XXXXXX`) + prefilled
   receipt email to `orders@stickers.cash`.
3. You match the payment against your wallet and ship.

Change `STORE_EMAIL` in `app.js` if the inbox differs. For automated payment
detection you'd add a server watching the address — nothing here requires one.

## Editing

- **Prices/products:** the `PRODUCTS` array at the top of `app.js`.
- **Shipping rates/thresholds:** the `SHIP` object in `app.js` (+ copy in `index.html`).
- **Countries list:** `COUNTRIES` in `app.js`.
- **New sticker design:** drop an SVG in `stickers/` (600×600-ish, transparent
  background, white kiss-cut border built in), then add a product entry.

## Run locally

```sh
python3 -m http.server 8765
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
