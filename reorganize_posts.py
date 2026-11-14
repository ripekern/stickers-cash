#!/usr/bin/env python3
import re
import os

# Define the new order: filename -> new_position
NEW_ORDER = {
    "the-ground-under-your-feet.html": 1,
    "four-leaks-in-every-digital-dollar.html": 2,
    "the-money-supply-never-stopped.html": 3,
    "the-price-level-is-the-tell.html": 4,
    "the-roof-you-didnt-fix.html": 5,
    "the-real-return-trap.html": 6,
    "the-story-of-bitcoin-cash.html": 7,
    "cash-rebuilt-for-the-internet.html": 8,
    "what-bch-actually-changes.html": 9,
    "a-wallet-is-not-an-account.html": 10,
    "one-transaction-end-to-end.html": 11,
    "fast-payments-final-settlement.html": 12,
    "the-fee-that-is-almost-nothing.html": 13,
    "your-address-is-not-your-identity.html": 14,
    "self-custody-with-confidence.html": 15,
    "think-in-coins-not-dollars.html": 16,
    "how-a-shop-takes-bch.html": 17,
    "scaling-without-a-ceiling.html": 18,
    "the-network-that-passed-the-test.html": 19,
    "start-before-the-ice-cracks.html": 20,
    "how-to-buy-your-first-bch.html": 21,
    "what-to-do-with-your-first-bch.html": 22,
    "a-day-in-the-life-with-bch.html": 23,
    "why-merchants-are-accepting-bch.html": 24,
    "money-that-can-run-rules.html": 25,
    "tokens-on-the-cash-layer.html": 26,
    "nfts-with-the-receipt-built-in.html": 27,
    "escrow-without-a-company.html": 28,
    "a-freelancer-paid-in-bch.html": 29,
    "a-nonprofit-accepting-bch.html": 30,
    "cross-border-remittances-with-bch.html": 31,
    "a-small-business-using-bch.html": 32,
    "online-creators-monetizing-with-bch.html": 33,
    "a-local-community-building-bch-commerce.html": 34,
    "emergency-aid-and-humanitarian-use-cases.html": 35,
    "the-future-of-internet-cash.html": 36,
}

BLOG_DIR = "/home/methuselah/Work/stickers-cash/blog"

def update_file_metadata(filename, new_position):
    """Update the position metadata in a blog post file."""
    filepath = os.path.join(BLOG_DIR, filename)
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    
    # Update the position in the metadata section (JSON-LD)
    content = re.sub(
        r'"position":\s*\d+',
        f'"position": {new_position}',
        content
    )
    
    # Update the "Post X of 37" display text
    content = re.sub(
        r'<span>Post \d+ of 37</span>',
        f'<span>Post {new_position} of 37</span>',
        content
    )
    
    # Special case: Change "Preamble" to "Preface" in post 1
    if new_position == 1:
        content = content.replace('Preamble', 'Preface')
        content = content.replace('preamble', 'preface')
    
    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False

def main():
    print("Updating blog post metadata...")
    updated_count = 0
    
    for filename, new_position in NEW_ORDER.items():
        filepath = os.path.join(BLOG_DIR, filename)
        if os.path.exists(filepath):
            if update_file_metadata(filename, new_position):
                print(f"✓ Updated {filename} -> Post {new_position}")
                updated_count += 1
            else:
                print(f"  No changes needed for {filename}")
        else:
            print(f"✗ File not found: {filename}")
    
    print(f"\nTotal files updated: {updated_count}")

if __name__ == "__main__":
    main()
