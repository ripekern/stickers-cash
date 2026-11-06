# Guide Reorganization Summary

## What Changed

The internet cash guide has been reorganized from a 30-post structure into a 37-post conversion-focused arc with 6 technical deep dives separated out.

## New Structure

### Part 1: The Problem (posts 1-6)
**Goal:** Hook the reader with why the current system is broken. Tight and visceral.

- Preamble: The ground under your feet (1)
- Chapter 1: What they don't tell you about your dollar (2-3)
  - Four leaks in every digital dollar
  - The money supply never stopped
- Chapter 2: The silent tax (4-6)
  - The price level is the tell
  - The roof you didn't fix
  - The real-return trap

**Why it works:** Only 6 posts instead of 13. Readers don't get lost in the problem before reaching the solution.

### Part 2: The Solution (posts 7-20)
**Goal:** Explain how BCH works and why it's different.

- Chapter 3: The way out (7-10)
  - Cash, rebuilt for the internet
  - What BCH actually changes
  - Think in coins, not dollars
  - Start before the ice cracks
- Chapter 4: How it actually works (11-13)
  - A wallet is not an account
  - One transaction, end to end
  - Fast payments, final settlement
- Chapter 5: Cheap, private, yours (14-16)
  - The fee that is almost nothing
  - Your address is not your identity
  - Self-custody with confidence
- Chapter 6: Built to scale (17-20)
  - The unit you measure in
  - How a shop takes BCH
  - Scaling without a ceiling
  - The network that passed the test

**Why it works:** All solution content is now together. No more whiplash between problem and solution.

### Part 3: The Revolution (posts 21-37)
**Goal:** Drive conversion and show real-world adoption.

- Chapter 7: Getting started (21-23) **NEW**
  - Why BCH is different from Bitcoin
  - How to buy your first BCH
  - What to do with your first BCH
- Chapter 8: Already in motion (24-26) **NEW**
  - A day in the life with BCH
  - Why merchants are accepting BCH
  - Money that can run rules
- Chapter 9: Money with rules (27-29)
  - Tokens on the cash layer
  - NFTs with the receipt built in
  - Escrow without a company
- Chapter 10: The world is already on board (30-35)
  - A freelancer paid in BCH
  - A nonprofit accepting BCH
  - Cross-border remittances with BCH
  - A small business using BCH
  - Online creators monetizing with BCH
  - A local community building BCH commerce
- Chapter 11: Bitcoin Cash is everywhere (36)
  - emergency-aid-and-humanitarian-use-cases
- Chapter 12: The future (37) **NEW**
  - The future of internet cash

**Why it works:** New conversion-focused chapters address the elephant in the room (Bitcoin vs BCH), remove friction (how to buy), and show practical use. The longer Part 3 works because it's the payoff.

## Technical Deep Dives

6 posts moved from `blog/` to `deep-dives/` for post-conversion engagement:

1. **The script under every wallet** - Stack-based execution, opcodes, P2PKH
2. **CashScript without the ceremony** - High-level contract language
3. **Covenants: rules that follow the coin** - Introspection opcodes, vaults
4. **Atomic swaps without an exchange** - Hash time-locked contracts
5. **Money that streams** - Continuous payments, subscriptions
6. **The 2026 upgrade** - P2S, loops, functions, bitwise operations

These are valuable but too technical for the conversion funnel. Readers who already use BCH will appreciate them.

## Files Modified

### Created (6 new blog posts)
- `blog/why-bch-is-different-from-bitcoin.html`
- `blog/how-to-buy-your-first-bch.html`
- `blog/what-to-do-with-your-first-bch.html`
- `blog/a-day-in-the-life-with-bch.html`
- `blog/why-merchants-are-accepting-bch.html`
- `blog/the-future-of-internet-cash.html`

### Moved to deep-dives (6 posts)
- `deep-dives/the-script-under-every-wallet.html`
- `deep-dives/cashscript-without-the-ceremony.html`
- `deep-dives/covenants-rules-that-follow-the-coin.html`
- `deep-dives/atomic-swaps-without-an-exchange.html`
- `deep-dives/money-that-streams.html`
- `deep-dives/the-2026-upgrade.html`

### Updated metadata (all 37 blog posts)
- Position numbers
- Eyebrow breadcrumbs (Part X · Chapter Y)
- JSON-LD articleSection fields
- Previous/next post navigation links

### Rewritten
- `blog.html` - Complete restructure with new card order and updated JSON-LD

### Updated cross-references
- `blog/money-that-can-run-rules.html` - Link to deep dive
- `blog/escrow-without-a-company.html` - Link to deep dive
- `blog/the-ground-under-your-feet.html` - Structure section updated

### Documentation
- `README.md` - Updated blog structure description

## The Conversion Arc

**Before:**
- Part 1 (13 posts): Problem + some solution content mixed in
- Part 2 (12 posts): Solution + deep technical content
- Part 3 (12 posts): Advanced tech + use cases

**After:**
- Part 1 (6 posts): Pure problem - tight and visceral
- Part 2 (14 posts): Pure solution - BCH mechanics and benefits
- Part 3 (17 posts): Conversion + adoption + future

**Result:** Clearer narrative arc. Part 1 is short enough to keep readers. Part 3 is long enough to drive action. Technical content preserved in deep dives for engaged readers.
