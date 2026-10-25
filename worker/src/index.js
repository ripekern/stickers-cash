/*
 * stickers.cash payment API
 *
 * POST /address { orderId } -> { index, address }
 *   Allocates the next receive index from D1 and returns its CashAddr.
 *   Idempotent per orderId, so refreshes and retries reuse the same address.
 *
 * GET /health -> { ok, xpubConfigured }
 *
 * The account xpub lives in the XPUB secret. It never reaches the browser, and
 * this worker has no private keys, so it can hand out addresses but cannot spend.
 */

import { MAX_INDEX, makeDeriver, parseAccountXpub } from './derive.js';

const ORDER_ID = /^STK-[A-Z0-9]{4,12}$/;

const DEFAULT_ORIGINS = [
  'https://stickers.cash',
  'https://www.stickers.cash',
  'http://localhost:8765',
  'http://127.0.0.1:8765',
].join(',');

// Per-isolate cache: decoding + branch derivation only needs to happen once.
let cache = { xpub: '', addressAt: null };

function addressAt(env) {
  const xpub = env.XPUB;
  if (!xpub) throw new Error('XPUB secret is not set');
  if (cache.xpub !== xpub) {
    cache = { xpub, addressAt: makeDeriver(parseAccountXpub(xpub)) };
  }
  return cache.addressAt;
}

function corsHeaders(request, env) {
  const origin = request.headers.get('Origin');
  const allowed = (env.ALLOWED_ORIGINS || DEFAULT_ORIGINS)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const headers = {
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'content-type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };

  if (origin && (allowed.includes('*') || allowed.includes(origin))) {
    headers['Access-Control-Allow-Origin'] = allowed.includes('*') ? '*' : origin;
  }
  return headers;
}

function json(body, status, headers = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      ...headers,
    },
  });
}

async function allocate(request, env, headers) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'invalid JSON body' }, 400, headers);
  }

  const orderId =
    typeof body?.orderId === 'string' ? body.orderId.trim().toUpperCase() : '';
  if (!ORDER_ID.test(orderId)) {
    return json({ error: 'invalid orderId' }, 400, headers);
  }

  // Same order -> same address (page reloads, retries, back-and-forth steps).
  const existing = await env.DB.prepare(
    'SELECT hd_index, address FROM orders WHERE order_id = ?'
  )
    .bind(orderId)
    .first();
  if (existing) {
    return json(
      { index: existing.hd_index, address: existing.address, reused: true },
      200,
      headers
    );
  }

  // Atomic allocation: two concurrent checkouts can never get the same index.
  const row = await env.DB.prepare(
    'UPDATE counter SET next_index = next_index + 1 WHERE id = 1 AND next_index <= ? RETURNING next_index - 1 AS idx'
  )
    .bind(MAX_INDEX)
    .first();

  if (!row) {
    return json({ error: 'address space exhausted' }, 503, headers);
  }

  const index = row.idx;
  const address = addressAt(env)(index);

  await env.DB.prepare(
    'INSERT OR IGNORE INTO orders (order_id, hd_index, address) VALUES (?, ?, ?)'
  )
    .bind(orderId, index, address)
    .run();

  // If a concurrent request won the same orderId, return its row instead.
  const stored = await env.DB.prepare(
    'SELECT hd_index, address FROM orders WHERE order_id = ?'
  )
    .bind(orderId)
    .first();

  const winner = stored || { hd_index: index, address };
  return json({ index: winner.hd_index, address: winner.address }, 200, headers);
}

export default {
  async fetch(request, env) {
    const headers = corsHeaders(request, env);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers });
    }

    const { pathname } = new URL(request.url);

    try {
      if (pathname === '/health') {
        if (request.method !== 'GET') {
          return json({ error: 'method not allowed' }, 405, headers);
        }
        return json({ ok: true, xpubConfigured: Boolean(env.XPUB) }, 200, headers);
      }

      if (pathname === '/address') {
        if (request.method !== 'POST') {
          return json({ error: 'method not allowed' }, 405, headers);
        }
        return await allocate(request, env, headers);
      }

      return json({ error: 'not found' }, 404, headers);
    } catch (error) {
      console.error('payment worker error:', error);
      return json({ error: 'internal error' }, 500, headers);
    }
  },
};
