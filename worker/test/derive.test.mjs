import assert from 'node:assert/strict';
import test from 'node:test';

import { makeDeriver, parseAccountXpub } from '../src/derive.js';

// Published BIP39 test mnemonic ("abandon … about") at m/44'/145'/0'.
// Same vector Selene uses in src/kernel/wallet/__tests__/KeyManagerService.test.ts
const XPUB =
  'xpub6ByHsPNSQXTWZ7PLESMY2FufyYWtLXagSUpMQq7Un96SiThZH2iJB1X7pwviH1WtKVeDP6K8d6xxFzzoaFzF3s8BKCZx8oEDdDkNnp4owAZ';

const addressAt = makeDeriver(parseAccountXpub(XPUB));

test('derives the expected BCH BIP44 address at index 0', () => {
  assert.equal(
    addressAt(0),
    'bitcoincash:qqyx49mu0kkn9ftfj6hje6g2wfer34yfnq5tahq3q6'
  );
});

test('derives a stable, unique address per index', () => {
  assert.equal(
    addressAt(1),
    'bitcoincash:qp8sfdhgjlq68hlzka9lcsxtcnvuvnd0xqxugfzzc5'
  );
  assert.notEqual(addressAt(1), addressAt(2));
  assert.equal(addressAt(7), addressAt(7));
  assert.match(addressAt(12345), /^bitcoincash:q[0-9a-z]{41}$/);
});

test('change branch differs from receive branch', () => {
  const changeAt = makeDeriver(parseAccountXpub(XPUB), 1);
  assert.notEqual(changeAt(0), addressAt(0));
});

test('rejects out-of-range indices', () => {
  assert.throws(() => addressAt(-1));
  assert.throws(() => addressAt(2 ** 31));
  assert.throws(() => addressAt(1.5));
});
