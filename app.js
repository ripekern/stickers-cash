/* ============================================================
   stickers.cash — cart, checkout, Bitcoin Cash payment
   ============================================================ */
'use strict';

/* ---------------- config ---------------- */
// Watch-only address at m/44'/145'/0'/0/0. Used if the per-order API is down.
const BCH_ADDRESS = 'bitcoincash:qqmgqc33anq340gsy6mfrf5c0c9rhf7805xwns52am';
const PAY_API = 'https://stickers-cash-pay.stickers-cash-pay.workers.dev'; // per-order addresses
const FALLBACK_RATE = 277.76;          // USD per BCH, used if the rate API is unreachable
const QUOTE_SECONDS = 15 * 60;         // rate lock
const STORE_EMAIL = 'orders@stickers.cash';
const STORE_KEY = 'stickers_cash_cart_v1';
const ORDER_KEY = 'stickers_cash_order_v1';

const SHIP = {
  us:    { label: 'USPS First Class',      days: '3–7 business days',  price: 2, freeOver: 25 },
  intl:  { label: 'International airmail', days: '7–21 business days', price: 6, freeOver: 50 },
};

const SIZES = [
  { v: '3', label: '3 inch', add: 0 },
  { v: '4', label: '4 inch', add: 1 },
  { v: '6', label: '6 inch', add: 3 },
];
const FINISHES = [
  { v: 'matte', label: 'Matte vinyl',   add: 0 },
  { v: 'gloss', label: 'Glossy vinyl',  add: 0 },
];

const COUNTRIES = [
  'United States','Canada','Mexico','United Kingdom','Ireland','Germany','France','Netherlands',
  'Belgium','Spain','Portugal','Italy','Switzerland','Austria','Sweden','Norway','Denmark',
  'Finland','Poland','Czechia','Slovakia','Hungary','Romania','Greece','Croatia','Bulgaria',
  'Ukraine','Turkey','Israel','United Arab Emirates','Saudi Arabia','Qatar','India','Pakistan',
  'Bangladesh','Sri Lanka','Nepal','China','Hong Kong SAR','Taiwan','Japan','South Korea',
  'Singapore','Malaysia','Thailand','Philippines','Indonesia','Vietnam','Australia','New Zealand',
  'Brazil','Argentina','Chile','Colombia','Peru','Ecuador','Uruguay','South Africa','Nigeria',
  'Kenya','Ghana','Egypt','Morocco','Tanzania','Ethiopia','Jamaica','Trinidad & Tobago','Fiji',
];

/* ---------------- products ---------------- */
const PRODUCTS = [
  {
    id: 'circle-mark', name: 'BCH Circle Mark', cat: 'logos', catLabel: 'Logo',
    price: 4, art: 'stickers/circle-mark.svg',
    blurb: 'The official green ₿ circle — the mark everybody knows on sight.',
  },
  {
    id: 'accepted-here', name: 'Accepted Here Badge', cat: 'logos', catLabel: 'Logo',
    price: 4, art: 'stickers/accepted-here.svg',
    blurb: 'The classic merchant badge for your window, register or laptop lid.',
  },
  {
    id: 'p2p-badge', name: 'Peer-to-Peer Seal', cat: 'logos', catLabel: 'Badge',
    price: 5, art: 'stickers/p2p-badge.svg',
    blurb: 'Roundel style: Peer · To · Peer · Electronic · Cash, wrapped around the mark.',
  },
  {
    id: 'internet-cash', name: 'Internet Cash', cat: 'sayings', catLabel: 'Saying',
    price: 4, art: 'stickers/internet-cash.svg',
    blurb: 'Two words that describe what money was always supposed to be.',
  },
  {
    id: 'under-1-cent', name: 'Under 1¢', cat: 'sayings', catLabel: 'Saying',
    price: 4, art: 'stickers/under-1-cent.svg',
    blurb: 'A receipt for a $1,000 payment that cost less than a penny. Frame it.',
  },
  {
    id: 'pay-me', name: 'Pay Me in BCH', cat: 'sayings', catLabel: 'Saying',
    price: 4, art: 'stickers/pay-me.svg',
    blurb: 'For freelancers, tip jars and invoices that should settle in seconds.',
  },
  {
    id: 'heart', name: 'BCH Heart', cat: 'sayings', catLabel: 'Saying',
    price: 4, art: 'stickers/heart.svg',
    blurb: 'Say it with your laptop lid. Green, loud and impossible to unstick.',
  },
  {
    id: 'money-over-ip', name: 'Money Over IP', cat: 'sayings', catLabel: 'Saying',
    price: 4, art: 'stickers/money-over-ip.svg',
    blurb: 'Packets in, packets out. That is the whole banking system now.',
  },
  {
    id: 'paid-peep', name: 'Paid in BCH Peep', cat: 'characters', catLabel: 'Character',
    price: 5, art: 'stickers/paid-peep.svg',
    blurb: 'Our friendly peep holding the only currency receipt that matters.',
  },
  {
    id: 'starter-mix', name: 'Starter Mix', cat: 'bundles', catLabel: 'Bundle',
    price: 16, bundle: true, packSize: 5,
    spec: '5 assorted stickers · 3″ matte',
    arts: ['stickers/circle-mark.svg','stickers/internet-cash.svg','stickers/heart.svg','stickers/pay-me.svg'],
    blurb: 'Five bestsellers, mixed at random — the fastest way to cover a laptop lid.',
  },
  {
    id: 'merchant-pack', name: 'Merchant Pack', cat: 'bundles', catLabel: 'Bundle',
    price: 25, bundle: true, packSize: 10, art: 'stickers/accepted-here.svg',
    spec: '10× Accepted Here · 3″ matte',
    blurb: 'Stick one by the register and hand the rest to every paying customer.',
  },
  {
    id: 'whole-roll', name: 'The Whole Roll', cat: 'bundles', catLabel: 'Bundle',
    price: 38, bundle: true, packSize: 15,
    spec: '15 stickers · every design · 3″',
    arts: ['stickers/p2p-badge.svg','stickers/under-1-cent.svg','stickers/money-over-ip.svg','stickers/paid-peep.svg'],
    blurb: 'Every design plus two bonus peeks. The best value per sticker in the shop.',
  },
];
const byId = id => PRODUCTS.find(p => p.id === id);

/* ---------------- state ---------------- */
let cart = loadCart();
let dest = 'us';                 // cart drawer estimate
let rate = FALLBACK_RATE;
let rateLive = false;
let orderId = loadOrderId();
let payAddress = BCH_ADDRESS;          // this order's address (falls back to cart/worker)
let payIndex = null;                   // HD index from the payment API, for support/receipts
let payFor = null;                     // order id the address was allocated for
let quoteLeft = QUOTE_SECONDS;
let quoteInterval = null;
let currentStep = 'details';

// Keep the order id across reloads so a customer who refreshes the pay screen
// still sees the same address (the payment API is idempotent per order id).
function loadOrderId() {
  try { return sessionStorage.getItem(ORDER_KEY); } catch { return null; }
}
function saveOrderId(id) {
  try { sessionStorage.setItem(ORDER_KEY, id); } catch {}
}
function clearOrderId() {
  try { sessionStorage.removeItem(ORDER_KEY); } catch {}
}

function loadCart() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORE_KEY) || '[]');
    if (!Array.isArray(raw)) return [];
    return raw.filter(l => l && byId(l.id) && l.qty > 0).map(normalizeLine);
  } catch { return []; }
}

// keep saved carts valid when an option is discontinued (e.g. the transparent finish)
function normalizeLine(l) {
  if (l.finish && !FINISHES.some(f => f.v === l.finish)) {
    l.finish = 'matte';
    l.key = byId(l.id).bundle ? `${l.id}|pack` : `${l.id}|${l.size}|matte`;
  }
  return l;
}
function saveCart() { localStorage.setItem(STORE_KEY, JSON.stringify(cart)); }

/* ---------------- helpers ---------------- */
const $  = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const usd = n => '$' + n.toFixed(2);

function toast(msg, ms = 2400) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), ms);
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;opacity:0';
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch {}
    ta.remove();
    return ok;
  }
}

function flashCopyBtn(btn) {
  const old = btn.textContent;
  btn.textContent = 'Copied ✓';
  btn.classList.add('done');
  setTimeout(() => { btn.textContent = old; btn.classList.remove('done'); }, 1400);
}

function stickerCount(list = cart) {
  return list.reduce((n, l) => {
    const p = byId(l.id);
    if (!p) return n;
    return n + (p.bundle ? p.packSize * l.qty : l.qty);
  }, 0);
}

function unitPrice(p, size, finish) {
  if (p.bundle) return p.price;
  const s = SIZES.find(x => x.v === size) || SIZES[0];
  const f = FINISHES.find(x => x.v === finish) || FINISHES[0];
  return p.price + s.add + f.add;
}

function totalsFor(list, where) {
  const subtotal = list.reduce((sum, l) => {
    const p = byId(l.id);
    if (!p) return sum;
    return sum + unitPrice(p, l.size, l.finish) * (l.qty || 1);
  }, 0);
  const count = stickerCount(list);
  const pct = count >= 10 ? 0.15 : count >= 5 ? 0.10 : count >= 3 ? 0.05 : 0;
  const savings = Math.round(subtotal * pct * 100) / 100;
  const after = subtotal - savings;
  const s = SHIP[where];
  const shipping = list.length === 0 ? 0 : (after >= s.freeOver ? 0 : s.price);
  return {
    count, subtotal, savings, shipping,
    freeGap: Math.max(0, s.freeOver - after),
    total: Math.round((after + shipping) * 100) / 100,
    pct,
  };
}

/* ============================================================
   SHOP GRID
   ============================================================ */
function optionRow(kind, values, current) {
  const opts = values.map(v =>
    `<option value="${v.v}"${v.v === current ? ' selected' : ''}>${v.label}</option>`).join('');
  return `<select class="opt-${kind}" aria-label="${kind}">${opts}</select>`;
}

function cardHTML(p) {
  const isBundle = !!p.bundle;
  const artHTML = isBundle && p.arts
    ? `<div class="collage">${p.arts.map(a => `<img src="${a}" alt="" loading="lazy">`).join('')}</div>`
    : `<img src="${isBundle ? p.art : p.art}" alt="${p.name} sticker" loading="lazy">`;

  const opts = isBundle
    ? `<label class="opt wide"><span>Packs</span>${optionRow('qty', qtyOpts(1, 6), '1')}</label>`
    : `<label class="opt"><span>Size</span>${optionRow('size', SIZES.map(s => ({ v: s.v, label: s.label + (s.add ? ` (+$${s.add})` : '') })), '3')}</label>
       <label class="opt"><span>Finish</span>${optionRow('finish', FINISHES.map(f => ({ v: f.v, label: f.label + (f.add ? ` (+$${f.add})` : '') })), 'matte')}</label>
       <label class="opt wide"><span>Qty</span>${optionRow('qty', qtyOpts(1, 10), '1')}</label>`;

  return `
  <article class="card" data-cat="${p.cat}" data-id="${p.id}">
    <div class="card-art">${artHTML}</div>
    <div class="card-body">
      <div class="card-top">
        <h3 class="card-title">${p.name}</h3>
        <span class="tag">${p.catLabel}</span>
      </div>
      <p class="card-blurb">${p.blurb}</p>
      ${p.spec ? `<p class="spec">${p.spec}</p>` : ''}
      <div class="price-row">
        <span class="price">$${p.price.toFixed(2)}</span>
        <span class="unit">${isBundle ? 'per pack' : 'each'}</span>
      </div>
      <div class="opts">${opts}</div>
      <button class="btn btn-primary btn-add">Add to cart</button>
    </div>
  </article>`;
}

function qtyOpts(from, to) {
  const out = [];
  for (let i = from; i <= to; i++) out.push({ v: String(i), label: String(i) });
  return out;
}

function renderGrid() {
  $('#grid').innerHTML = PRODUCTS.map(cardHTML).join('');
}

function applyFilter(f) {
  $$('.chip').forEach(c => c.classList.toggle('active', c.dataset.filter === f));
  $$('.card').forEach(card => {
    card.hidden = f !== 'all' && card.dataset.cat !== f;
  });
}

/* ---------- card interactions ---------- */
function bindGrid() {
  $('#grid').addEventListener('click', e => {
    const add = e.target.closest('.btn-add');
    if (!add) return;
    const card = add.closest('.card');
    const p = byId(card.dataset.id);
    if (!p) return;

    const size = p.bundle ? null : (card.querySelector('.opt-size')?.value || '3');
    const finish = p.bundle ? null : (card.querySelector('.opt-finish')?.value || 'matte');
    const qtySel = card.querySelector('.opt-qty');
    const qty = qtySel ? parseInt(qtySel.value, 10) || 1 : 1;
    addToCart(p, size, finish, qty);

    add.textContent = 'Added ✓';
    add.classList.add('added');
    setTimeout(() => { add.textContent = 'Add to cart'; add.classList.remove('added'); }, 1200);
  });

  $('#grid').addEventListener('change', e => {
    if (!e.target.matches('.opt-size, .opt-finish')) return;
    const card = e.target.closest('.card');
    const p = byId(card.dataset.id);
    if (!p) return;
    const size = card.querySelector('.opt-size')?.value || '3';
    const finish = card.querySelector('.opt-finish')?.value || 'matte';
    card.querySelector('.price').textContent = '$' + unitPrice(p, size, finish).toFixed(2);
  });

  $('#filters').addEventListener('click', e => {
    const chip = e.target.closest('.chip');
    if (chip) applyFilter(chip.dataset.filter);
  });

  $$('[data-jump-filter]').forEach(el =>
    el.addEventListener('click', () => applyFilter(el.dataset.jumpFilter)));
}

/* ============================================================
   CART
   ============================================================ */
function addToCart(p, size, finish, qty) {
  const key = p.bundle ? `${p.id}|pack` : `${p.id}|${size}|${finish}`;
  const line = cart.find(l => l.key === key);
  if (line) {
    line.qty = Math.min(99, line.qty + qty);
  } else cart.push({ key, id: p.id, size: p.bundle ? null : size, finish: p.bundle ? null : finish, qty });
  saveCart();
  renderCart();
  bumpCart();
  toast(`${p.name} added to cart`);
}

function bumpCart() {
  const btn = $('#cartBtn');
  btn.classList.remove('bump');
  void btn.offsetWidth;
  btn.classList.add('bump');
}

function lineOptions(l) {
  const p = byId(l.id);
  if (p.bundle) return p.spec;
  const s = SIZES.find(x => x.v === l.size);
  const f = FINISHES.find(x => x.v === l.finish);
  return `${s ? s.label : ''} · ${f ? f.label : ''}`;
}

function renderCart() {
  const lines = $('#cartLines');
  const count = stickerCount();
  const empty = cart.length === 0;

  $('#cartEmpty').hidden = !empty;
  lines.hidden = empty;
  $('#cartFoot').hidden = empty;
  $('#cartCount').hidden = count === 0;
  $('#cartCount').textContent = count;
  $('#drawerCount').textContent = empty ? '' : `· ${count} sticker${count === 1 ? '' : 's'}`;

  lines.innerHTML = cart.map(l => {
    const p = byId(l.id);
    const unit = unitPrice(p, l.size, l.finish);
    const thumb = p.bundle ? (p.arts ? p.arts[0] : p.art) : p.art;
    return `
    <li class="cart-line" data-key="${l.key}">
      <div class="cl-thumb"><img src="${thumb}" alt=""></div>
      <div class="cl-info">
        <span class="cl-name">${p.name}</span>
        <span class="cl-opts">${lineOptions(l)}</span>
        <span class="cl-unit">${usd(unit)} each</span>
      </div>
      <div class="cl-right">
        <div class="cl-stepper">
          <button class="cl-step" data-act="dec" aria-label="Decrease">−</button>
          <span class="cl-qty">${l.qty}</span>
          <button class="cl-step" data-act="inc" aria-label="Increase">+</button>
        </div>
        <span class="cl-total">${usd(unit * l.qty)}</span>
        <button class="cl-remove" data-act="rm">remove</button>
      </div>
    </li>`;
  }).join('');

  const t = totalsFor(cart, dest);
  $('#tSub').textContent = usd(t.subtotal);
  $('#tSave').textContent = '−' + usd(t.savings);
  $('#savingsRow').hidden = t.savings === 0;
  $('#tShip').textContent = t.shipping === 0 ? 'FREE' : usd(t.shipping);
  $('#tTotal').textContent = usd(t.total);
}

function bindCart() {
  $('#cartLines').addEventListener('click', e => {
    const btn = e.target.closest('[data-act]');
    if (!btn) return;
    const key = btn.closest('.cart-line').dataset.key;
    const line = cart.find(l => l.key === key);
    if (!line) return;
    const act = btn.dataset.act;
    if (act === 'inc') line.qty = Math.min(99, line.qty + 1);
    if (act === 'dec') line.qty > 1 ? line.qty-- : (cart = cart.filter(l => l.key !== key));
    if (act === 'rm') cart = cart.filter(l => l.key !== key);
    saveCart();
    renderCart();
  });

  $('#destSelect').addEventListener('change', e => {
    dest = e.target.value;
    renderCart();
  });

  $('#cartBtn').addEventListener('click', openDrawer);
  $('#closeCart').addEventListener('click', closeDrawer);
  $('#drawerBackdrop').addEventListener('click', closeDrawer);
  $('#emptyBrowse').addEventListener('click', () => {
    closeDrawer();
    document.getElementById('shop').scrollIntoView({ behavior: 'smooth' });
  });
  $('#checkoutBtn').addEventListener('click', () => {
    if (!cart.length) return;
    closeDrawer();
    openCheckout();
  });
}

function openDrawer() {
  $('#drawerBackdrop').hidden = false;
  requestAnimationFrame(() => $('#drawerBackdrop').classList.add('show'));
  $('#cartDrawer').classList.add('open');
  $('#cartDrawer').setAttribute('aria-hidden', 'false');
  document.body.classList.add('no-scroll');
}
function closeDrawer() {
  $('#drawerBackdrop').classList.remove('show');
  $('#cartDrawer').classList.remove('open');
  $('#cartDrawer').setAttribute('aria-hidden', 'true');
  setTimeout(() => { $('#drawerBackdrop').hidden = true; }, 220);
  if ($('#checkoutModal').hidden) document.body.classList.remove('no-scroll');
}

/* ============================================================
   CHECKOUT — step 1: details
   ============================================================ */
function renderCountries() {
  $('#fCountry').innerHTML = COUNTRIES.map(c =>
    `<option value="${c}"${c === 'United States' ? ' selected' : ''}>${c}</option>`).join('');
}

function currentWhere() {
  return $('#fCountry').value === 'United States' ? 'us' : 'intl';
}

function renderSummary() {
  const where = currentWhere();
  const t = totalsFor(cart, where);
  const rows = cart.map(l => {
    const p = byId(l.id);
    const unit = unitPrice(p, l.size, l.finish);
    return `<li class="mini-line">
      <span class="ml-info"><span class="ml-name">${p.name} × ${l.qty}</span>
      <span class="ml-meta">${lineOptions(l)}</span></span>
      <span class="ml-price">${usd(unit * l.qty)}</span></li>`;
  }).join('');

  ['#miniLines', '#payLines'].forEach(sel => { $(sel).innerHTML = rows; });
  $('#mSub').textContent = usd(t.subtotal);
  $('#mSave').textContent = '−' + usd(t.savings);
  $('#mSavingsRow').hidden = t.savings === 0;
  $('#mShip').textContent = t.shipping === 0 ? 'FREE' : usd(t.shipping);
  $('#mTotal').textContent = usd(t.total);
  $('#payTotalUsd').textContent = usd(t.total);

  const s = SHIP[where];
  const shipLabel = t.shipping === 0 ? 'FREE' : usd(t.shipping);
  $('#shipMethods').innerHTML = `
    <label class="ship-method">
      <input type="radio" name="ship" checked>
      <span><b>${s.label}</b><small>${where === 'us' ? 'From the USA' : 'Worldwide from the USA'} · ${s.days}</small></span>
      <span class="sm-price">${shipLabel}</span>
    </label>
    ${t.freeGap > 0 ? `<small class="muted" style="font-size:12px">Add ${usd(t.freeGap)} more for free shipping.</small>` : ''}`;
  return t;
}

function openCheckout() {
  $('#checkoutModal').hidden = false;
  document.body.classList.add('no-scroll');
  goStep('details');
  renderSummary();
}

function closeCheckout() {
  $('#checkoutModal').hidden = true;
  stopQuote();
  if (currentStep === 'done') {
    orderId = null;
    clearOrderId();
    payFor = null;
    payAddress = BCH_ADDRESS;
    payIndex = null;
  }   // completed order — next order gets a fresh ID
  document.body.classList.remove('no-scroll');
}

function goStep(step) {
  currentStep = step;
  const stepId = { details: 'stepDetails', pay: 'stepPay', done: 'stepDone' }[step];
  $$('.step').forEach(el => el.classList.toggle('active', el.id === stepId));
  $$('.snav').forEach(el => {
    const order = ['details', 'pay', 'done'];
    el.classList.toggle('active', el.dataset.step === step);
    el.classList.toggle('done', order.indexOf(el.dataset.step) < order.indexOf(step));
  });
  if (step !== 'pay') stopQuote();
  $('.modal-card').scrollTop = 0;
}

function validateDetails() {
  const checks = [
    ['fEmail', v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v), 'Enter a valid email'],
    ['fName',   v => v.trim().length >= 2, 'Required'],
    ['fAddr',   v => v.trim().length >= 4, 'Required'],
    ['fCity',   v => v.trim().length >= 2, 'Required'],
    ['fRegion', v => v.trim().length >= 2, 'Required'],
    ['fPostal', v => v.trim().length >= 3, 'Required'],
    ['fCountry', v => !!v, 'Required'],
  ];
  let firstBad = null;
  checks.forEach(([id, ok, msg]) => {
    const input = document.getElementById(id);
    const err = $(`.err[data-for="${id}"]`);
    const valid = ok(input.value);
    input.classList.toggle('bad', !valid);
    err.textContent = valid ? '' : msg;
    if (!valid && !firstBad) firstBad = input;
  });
  if (firstBad) { firstBad.focus(); toast('Please fix the highlighted fields'); }
  return !firstBad;
}

function bindCheckout() {
  $('#closeModal').addEventListener('click', closeCheckout);
  $('#modalBackdrop').addEventListener('click', closeCheckout);
  $('#backToCart').addEventListener('click', () => { closeCheckout(); openDrawer(); });
  $('#backToDetails').addEventListener('click', () => { stopQuote(); goStep('details'); renderSummary(); });

  $('#fCountry').addEventListener('change', () => {
    dest = currentWhere();
    $('#destSelect').value = dest;
    renderCart();
    renderSummary();
  });

  $('#stepDetails').addEventListener('submit', e => {
    e.preventDefault();
    if (!validateDetails()) return;
    if (!cart.length) { closeCheckout(); return; }
    goStep('pay');
    startPay();
  });

  $('#copyAmt').addEventListener('click', async e => {
    if (await copyText($('#payBchAmount').textContent.trim())) flashCopyBtn(e.currentTarget);
  });
  $('#copyAddr').addEventListener('click', async e => {
    if (await copyText(payAddress)) flashCopyBtn(e.currentTarget);
  });
  $('#copyOrderId').addEventListener('click', async e => {
    if (await copyText(orderId || '')) flashCopyBtn(e.currentTarget);
  });

  $('#paidBtn').addEventListener('click', finishOrder);
  $('#newOrderBtn').addEventListener('click', () => {
    closeCheckout();
    document.getElementById('shop').scrollIntoView({ behavior: 'smooth' });
  });
}

/* ============================================================
   CHECKOUT — step 2: pay with Bitcoin Cash
   ============================================================ */
async function fetchRate() {
  try {
    const ctl = new AbortController();
    const to = setTimeout(() => ctl.abort(), 6000);
    const r = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin-cash&vs_currencies=usd',
      { signal: ctl.signal });
    clearTimeout(to);
    const j = await r.json();
    const v = j && j.bitcoin_cash && j.bitcoin_cash.usd;
    if (typeof v === 'number' && v > 0) return { rate: v, live: true };
  } catch {}
  return { rate: FALLBACK_RATE, live: false };
}

function makeOrderId() {
  const abc = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < 8; i++) s += abc[Math.floor(Math.random() * abc.length)];
  return 'STK-' + s;
}

// Ask the payment worker for this order's fresh address. Returns null if the
// API is unreachable.
async function allocateAddress(id) {
  if (!PAY_API) return null;
  const ctl = new AbortController();
  const to = setTimeout(() => ctl.abort(), 4000);
  try {
    const r = await fetch(PAY_API.replace(/\/+$/, '') + '/address', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ orderId: id }),
      signal: ctl.signal,
    });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const j = await r.json();
    if (!j || typeof j.address !== 'string' || !/^bitcoincash:q[0-9a-z]{41}$/.test(j.address)) {
      throw new Error('unexpected address');
    }
    return { address: j.address, index: Number.isInteger(j.index) ? j.index : null };
  } catch (e) {
    console.warn('Payment API unavailable.', e);
    return null;
  } finally {
    clearTimeout(to);
  }
}

async function startPay() {
  if (!orderId) { orderId = makeOrderId(); saveOrderId(orderId); }
  $('#payOrderId').textContent = orderId;
  $('#doneOrderId').textContent = orderId;

  // Reuse the address already assigned to this order, even if the API is
  // temporarily down on a later visit to this step. If allocation fails, keep
  // the published fallback address so the customer can still pay.
  if (payFor !== orderId) {
    const alloc = await allocateAddress(orderId);
    if (alloc && alloc.address) {
      payAddress = alloc.address;
      payIndex = alloc.index;
      payFor = orderId;
    } else {
      payAddress = BCH_ADDRESS;
      payIndex = null;
      payFor = null;
    }
  }
  if (payAddress) {
    $('#payAddr').textContent = payAddress;
  } else {
    $('#payAddr').textContent = 'Payment address unavailable — email orders@stickers.cash';
  }
  $('#copyAddr').disabled = !payAddress;

  const where = currentWhere();
  const t = totalsFor(cart, where);
  const country = $('#fCountry').value;
  $('#payShipTo').textContent =
    `${country} · ${SHIP[where].label}${t.shipping === 0 ? ' · FREE' : ' · ' + usd(t.shipping)}`;

  renderSummary();
  await refreshQuote(true);
  startQuoteTimer();

  $('#receiptMail').href = mailtoLink(t);
}

function bchAmount(t) {
  return (t.total / rate).toFixed(6);
}

async function refreshQuote(firstTime) {
  const { rate: r, live } = await fetchRate();
  rate = r; rateLive = live;
  quoteLeft = QUOTE_SECONDS;

  const t = totalsFor(cart, currentWhere());
  const amount = bchAmount(t);

  $('#payBchAmount').textContent = amount + ' BCH';
  $('#payUsdLine').textContent = `= ${usd(t.total)} USD · 1 BCH = ${usd(rate)}`;
  $('#rateLine').textContent = live
    ? `Rate: ${usd(rate)} / BCH · live (CoinGecko)`
    : `Rate: ${usd(rate)} / BCH · offline fallback — pay this exact amount`;

  const img = $('#payQr');
  if (payAddress) {
    const uri = `bitcoincash:${payAddress.replace('bitcoincash:', '')}?amount=${amount}`;
    img.onerror = () => {
      img.hidden = true;
      $('#qrHint').textContent =
        'QR unavailable — copy the address and send the exact amount shown above.';
    };
    img.hidden = false;
    img.src = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=10&ecc=M&data=${encodeURIComponent(uri)}`;
  } else {
    img.hidden = true;
    $('#qrHint').textContent =
      'Payment address unavailable — email orders@stickers.cash and we will send one.';
  }

  if (!firstTime) toast('Rate refreshed — pay the new amount above');
}

function startQuoteTimer() {
  stopQuote();
  paintQuote();
  quoteInterval = setInterval(() => {
    quoteLeft--;
    if (quoteLeft <= 0) { refreshQuote(false); }
    paintQuote();
  }, 1000);
}
function stopQuote() {
  if (quoteInterval) clearInterval(quoteInterval);
  quoteInterval = null;
}
function paintQuote() {
  const m = Math.floor(Math.max(0, quoteLeft) / 60);
  const s = Math.max(0, quoteLeft) % 60;
  $('#quoteTimer').textContent = `${m}:${String(s).padStart(2, '0')}`;
  $('#quoteBox').classList.toggle('warn', quoteLeft < 120);
}

function mailtoLink(t) {
  const amount = bchAmount(t);
  const items = cart.map(l => {
    const p = byId(l.id);
    const unit = unitPrice(p, l.size, l.finish);
    const opts = lineOptions(l);
    return `  ${l.qty} × ${p.name}${opts ? ` (${opts})` : ''} — ${usd(unit * l.qty)}`;
  });
  const body = [
    `Order: ${orderId}`,
    `Amount sent: ${amount} BCH (${usd(t.total)} USD)`,
    `To address: ${payAddress}`,
    ...(payIndex === null ? [] : [`Address index: ${payIndex}`]),
    '',
    `Items (${t.count} sticker${t.count === 1 ? '' : 's'}):`,
    ...items,
    '',
    `Subtotal: ${usd(t.subtotal)}`,
    ...(t.savings ? [`Volume discount: −${usd(t.savings)}`] : []),
    `Shipping: ${t.shipping === 0 ? 'FREE' : usd(t.shipping)}`,
    `Total: ${usd(t.total)}`,
    '',
    'Shipping details:',
    `  ${$('#fName').value}`,
    `  ${$('#fAddr').value}`,
    `  ${$('#fCity').value}, ${$('#fRegion').value} ${$('#fPostal').value}`,
    `  ${$('#fCountry').value}`,
    `  Email: ${$('#fEmail').value}`,
    '',
    'Txid or wallet receipt screenshot is attached.',
  ].join('\n');
  return `mailto:${STORE_EMAIL}?subject=${encodeURIComponent('Payment receipt — ' + orderId)}&body=${encodeURIComponent(body)}`;
}

function finishOrder() {
  const t = totalsFor(cart, currentWhere());
  $('#receiptMail').href = mailtoLink(t);
  cart = [];
  saveCart();
  renderCart();
  orderId = orderId || makeOrderId();
  $('#doneOrderId').textContent = orderId;
  goStep('done');
  toast('Payment marked as sent — thank you!');
}

/* ============================================================
   global bits
   ============================================================ */
function bindGlobalCopy() {
  document.addEventListener('click', async e => {
    const btn = e.target.closest('[data-copy]');
    if (!btn) return;
    if (await copyText(btn.dataset.copy)) {
      flashCopyBtn(btn);
      toast('Address copied');
    }
  });
}

function bindMenu() {
  const menu = $('#menuBtn');
  menu.addEventListener('click', () => {
    const open = $('#mainNav').classList.toggle('open');
    menu.classList.toggle('open', open);
    menu.setAttribute('aria-expanded', String(open));
  });
  $$('#mainNav a').forEach(a => a.addEventListener('click', () => {
    $('#mainNav').classList.remove('open');
    menu.classList.remove('open');
    menu.setAttribute('aria-expanded', 'false');
  }));
}

function bindKeys() {
  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    if (!$('#checkoutModal').hidden) closeCheckout();
    else if ($('#cartDrawer').classList.contains('open')) closeDrawer();
  });
}

function bindReveal() {
  if (!('IntersectionObserver' in window)) {
    $$('.reveal').forEach(el => el.classList.add('in'));
    return;
  }
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
  }, { threshold: 0.15 });
  $$('.reveal').forEach(el => io.observe(el));
}

/* ---------------- boot ---------------- */
document.addEventListener('DOMContentLoaded', () => {
  renderGrid();
  bindGrid();
  bindCart();
  renderCountries();
  bindCheckout();
  bindGlobalCopy();
  bindMenu();
  bindKeys();
  bindReveal();
  renderCart();
  applyFilter('all');
});
