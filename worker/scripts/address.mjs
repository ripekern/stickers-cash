/*
 * Print derived addresses for a range of indices.
 *
 *   set -a; . .dev.vars; set +a
 *   npm run address -- 0 5
 *
 * Use it to confirm which index your published address sits at before setting
 * the counter's start value.
 */

import { makeDeriver, parseAccountXpub } from '../src/derive.js';

const xpub = process.env.XPUB;
if (!xpub) {
  console.error('Set XPUB first, e.g.: set -a; . .dev.vars; set +a');
  process.exit(1);
}

const from = Number.parseInt(process.argv[2] ?? '0', 10);
const to = Number.parseInt(process.argv[3] ?? String(from), 10);

if (!Number.isInteger(from) || !Number.isInteger(to) || from < 0 || to < from) {
  console.error('Usage: npm run address -- <fromIndex> [toIndex]');
  process.exit(1);
}

const addressAt = makeDeriver(parseAccountXpub(xpub));
for (let i = from; i <= to; i += 1) {
  console.log(`${i}\t${addressAt(i)}`);
}
