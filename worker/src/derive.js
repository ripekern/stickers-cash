/*
 * Derive BCH receive addresses from an account-level xpub.
 *
 * Layout assumed: m/44'/145'/0'/0/<index>
 * The xpub must be at m/44'/145'/0' (depth 3). Everything below the account is
 * non-hardened, so it can be derived with public keys only.
 */

import { HDKey } from '@scure/bip32';
import cashaddr from 'cashaddrjs';

export const MAX_INDEX = 2 ** 31 - 1;

export function parseAccountXpub(xpub) {
  const encoded = xpub.trim();

  if (encoded.startsWith('xprv')) {
    throw new Error(
      'That is an xprv (a private key). Use the xpub — this worker must never hold spending keys.'
    );
  }
  if (encoded.startsWith('tpub')) {
    throw new Error('Expected a mainnet xpub, got a testnet tpub');
  }
  if (encoded.startsWith('ypub') || encoded.startsWith('zpub')) {
    throw new Error(
      'Expected a standard xpub. Convert ypub/zpub to xpub first (BCH uses P2PKH).'
    );
  }
  if (!encoded.startsWith('xpub')) {
    throw new Error('Expected a standard mainnet xpub (starts with "xpub")');
  }

  let account;
  try {
    account = HDKey.fromExtendedKey(encoded);
  } catch (error) {
    throw new Error(`Invalid xpub: ${error.message}`);
  }

  if (account.privateKey) {
    throw new Error('This key includes a private key. Use the account xpub.');
  }
  if (account.depth !== 3) {
    throw new Error(
      `Expected an account-level xpub (depth 3, e.g. m/44'/145'/0'), got depth ${account.depth}. ` +
        'Export the account xpub, not the master key or a single child.'
    );
  }

  return account;
}

/** Returns addressAt(index) for the receive (change = 0) branch. */
export function makeDeriver(account, change = 0) {
  const branch = account.deriveChild(change);

  return function addressAt(index) {
    if (!Number.isInteger(index) || index < 0 || index > MAX_INDEX) {
      throw new Error(`Invalid address index: ${index}`);
    }
    const { identifier } = branch.deriveChild(index); // hash160(compressed pubkey)
    return cashaddr.encode('bitcoincash', 'P2PKH', identifier);
  };
}
