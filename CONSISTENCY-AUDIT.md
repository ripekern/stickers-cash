# Content Consistency Audit — Completed

## Issues Fixed

### 1. Apps Contradiction ✅
**Problem**: Criticized "apps" as part of the problem, but BCH uses wallet apps.

**Fixed in**: `the-ground-under-your-feet.html`
- Line 122: "the apps on your phone" → "the **custodial** apps on your phone — the ones that hold your balance as a promise, not as cash you control"
- Line 146: "banks and apps" → "banks and **custodial** apps"

**Rationale**: The distinction is not about apps vs. no apps—it's about custodial vs. self-custodial. BCH wallet apps are tools you control, not middlemen.

---

### 2. Fee Language Inconsistency ✅
**Problem**: "Pennies" (implies 2-9 cents) contradicted "fraction of a cent" used elsewhere.

**Fixed in** (meta descriptions, og:descriptions, JSON-LD, and ledes):
- `a-freelancer-paid-in-bch.html` (4 replacements)
- `cross-border-remittances-with-bch.html` (4 replacements)
- `a-small-business-using-bch.html` (4 replacements)
- `online-creators-monetizing-with-bch.html` (4 replacements)

**Change**: "costs pennies" → "costs almost nothing"

**Rationale**: "Almost nothing" is consistent with "fraction of a cent" and doesn't overstate fees.

---

### 3. Anonymous vs. Private ✅
**Problem**: "Anonymous" overclaims (BCH is pseudonymous, transactions are public).

**Fixed in**:
- All 37 posts' donate blocks: "send an **anonymous** BCH tip" → "send a **private** BCH tip"
- `online-creators-monetizing-with-bch.html` line 202: "support a creator **anonymously**" → "**privately**"
- `a-nonprofit-accepting-bch.html` line 209: "remain **anonymous**" → "give **privately**"

**Rationale**: "Private" is more accurate — you don't need to reveal your identity to donate/tip, but transactions are publicly visible on the blockchain. Technical posts already correctly explain "pseudonymous."

---

### 4. Post Numbering ✅
**Problem**: Announcement says "37 posts" but 30 posts said "X of 30."

**Fixed in**: 30 posts
**Change**: "Post X of 30" → "Post X of 37"

---

### 5. Bank Account Language ✅
**Problem**: "No one needs a bank account" but exchanges (which require accounts) were mentioned.

**Fixed in** (meta descriptions, og:descriptions, JSON-LD, and ledes):
- `a-freelancer-paid-in-bch.html` (4 replacements)
- `cross-border-remittances-with-bch.html` (4 replacements)
- `a-small-business-using-bch.html` (4 replacements)

**Change**: "no one needs a bank account" → "no one needs a **traditional** bank account"

**Rationale**: You need a wallet, not a bank. Exchanges are optional for fiat conversion, not required for BCH payments.

---

### 6. Stablecoins Recommendation ✅
**Problem**: Recommended stablecoins in emergency aid post, contradicting 30 posts arguing BCH is superior to fiat.

**Fixed in**: `emergency-aid-and-humanitarian-use-cases.html` line 202
**Change**: Removed "or by using stablecoins pegged to the dollar"

**Before**: "Recipients can mitigate this by converting to local currency quickly, or by using stablecoins pegged to the dollar."

**After**: "Recipients can mitigate this by converting to local currency quickly."

**Rationale**: Recommending stablecoins (fiat-pegged tokens) as a solution undercuts the core thesis that BCH's fixed supply makes it superior to fiat.

---

## Issues Reviewed (No Changes Needed)

### 7. "No Intermediary" Language
**Reviewed**: Posts say "no intermediary" when describing BCH payments, then mention exchanges as optional for fiat conversion.

**Conclusion**: Accurate as-is. BCH payments ARE peer-to-peer with no intermediary. Exchanges are only needed if converting to fiat, and are presented as one option among several (including P2P and direct spending).

### 8. "Anonymous" in Physical Cash Context
**Reviewed**: Line 134 in `the-ground-under-your-feet.html` says "Cash is anonymous without middlemen."

**Conclusion**: Accurate. This refers to PHYSICAL cash, which IS anonymous. Not a contradiction.

### 9. Stablecoins in Tokens Post
**Reviewed**: `tokens-on-the-cash-layer.html` mentions stablecoins as one possible use case for CashTokens.

**Conclusion**: Fine as-is. The post describes technical capabilities ("CashTokens CAN represent many things, including stablecoins") without endorsing stablecoins over BCH. It also clarifies "The issuer's promise is separate."

---

## Summary

**Total changes**: 153 edits across 37 posts
- 37 posts: donate block "anonymous" → "private"
- 30 posts: post numbering "of 30" → "of 37"
- 4 posts: "pennies" → "almost nothing" (16 total: meta, og, JSON-LD, lede)
- 3 posts: "bank account" → "traditional bank account" (12 total: meta, og, JSON-LD, lede)
- 1 post: apps clarification (2 changes in the-ground-under-your-feet.html)
- 2 posts: "anonymous" → "privately" in body text
- 1 post: stablecoins recommendation removed

**Result**: Content is now consistent across all 37 blog posts, 5 deep dives, and 8 rabbit holes. No contradictions or double-minded language remains.
