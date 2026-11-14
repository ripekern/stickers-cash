#!/usr/bin/env python3
"""
Comprehensive script to reorganize the blog posts according to the new structure:
- Preface: Post 1 (The ground under your feet)
- Part 1 (The Problem): Posts 2-7 (6 posts)
- Part 2 (The Solution): Posts 8-20 (13 posts)
- Part 3 (The Revolution): Posts 21-36 (16 posts)
"""

import re
import json

# New order mapping: position -> (filename, title, description)
NEW_STRUCTURE = {
    1: ("the-ground-under-your-feet.html", "The ground under your feet", "Cash is final, private, and needs no permission. Then a central bank, a gold window, and a digital rail replaced it — and put every dollar on thin ice."),
    2: ("four-leaks-in-every-digital-dollar.html", "Four leaks in every digital dollar", "Watched, freezable, fee-taxed, and melting. The deeper leak is the one most people never see: banks create the money they lend, and the central bank creates the reserves underneath it."),
    3: ("the-money-supply-never-stopped.html", "The money supply never stopped", "M2 did shrink in 2022–23. Then it reversed. By August 2026 the money supply hit a record $23.34 trillion — here is the cycle in one page."),
    4: ("the-price-level-is-the-tell.html", "The price level is the tell", "Inflation at 3.7% is not a record. The price level is. That difference explains why a \"cooling\" economy still feels expensive."),
    5: ("the-roof-you-didnt-fix.html", "The roof you didn't fix", "Repairs cost more, borrowing costs more, and cash pays 5%. So homeowners are living with leaky faucets — and turning $1 of deferred work into $4 of damage."),
    6: ("the-real-return-trap.html", "The real-return trap", "A 5% CD feels safe until you subtract money-supply growth. The math of \"safe\" savings — and why so many people still choose it."),
    7: ("the-story-of-bitcoin-cash.html", "The story of Bitcoin Cash", "From the original vision to today's reality. How Bitcoin Cash became the internet's peer-to-peer electronic cash system — fast, cheap, and built to be used."),
    8: ("cash-rebuilt-for-the-internet.html", "Cash, rebuilt for the internet", "Bitcoin Cash is what cash looks like when it has to travel through a screen: peer-to-peer, self-custodied, and final in seconds."),
    9: ("what-bch-actually-changes.html", "What BCH actually changes", "A fixed supply, real liquidity, and no bank in the middle. What Bitcoin Cash actually changes — and why it is built to be used."),
    10: ("a-wallet-is-not-an-account.html", "A wallet is not an account", "Your BCH does not sit inside an app. It sits on a public ledger. The wallet holds the one thing that can move it — and that changes who is really in charge."),
    11: ("one-transaction-end-to-end.html", "One transaction, end to end", "A payment is not a message to a bank. It is a signed instruction that spends specific coins and creates new ones. Here is the whole trip."),
    12: ("fast-payments-final-settlement.html", "Fast payments, final settlement", "A BCH payment reaches the receiver in seconds and settles in a block. That is not a delay — it is certainty."),
    13: ("the-fee-that-is-almost-nothing.html", "The fee that is almost nothing", "BCH fees are not a percentage of your payment. They are a price for space in a block — and BCH has a lot of space."),
    14: ("your-address-is-not-your-identity.html", "Your address is not your identity", "A BCH address is a destination, not a name badge. Modern wallets give you a fresh one for every payment — here is how that protects you."),
    15: ("self-custody-with-confidence.html", "Self-custody with confidence", "Self-custody is not a test of bravery. It is a tested backup, a simple routine, and the freedom to hold your own money."),
    16: ("think-in-coins-not-dollars.html", "Think in coins, not dollars", "The price moves; your stack doesn't. How a \"satoshi mindset\" turns saving into collecting a fixed share of a finite supply."),
    17: ("how-a-shop-takes-bch.html", "How a shop takes BCH", "Accepting BCH gives a shop a direct, final settlement path with low fees. Here is how the flow works — and why it is good for small tickets."),
    18: ("scaling-without-a-ceiling.html", "Scaling without a ceiling", "BCH scales by expanding the pipe. When demand rises, the block limit grows to match — instead of freezing capacity at a fixed number."),
    19: ("the-network-that-passed-the-test.html", "The network that passed the test", "Bitcoin Cash has been deliberately flooded under real load. It kept clearing blocks and keeping fees low — a demonstration of what on-chain capacity is for."),
    20: ("start-before-the-ice-cracks.html", "Start before the ice cracks", "You don't need every metric to act on the simple part: hold your own keys, start with 0.1 BCH, and make internet cash part of your day."),
    21: ("how-to-buy-your-first-bch.html", "How to buy your first BCH", "The fastest path from dollars to Bitcoin Cash in your own wallet. No trading, no jargon — just the practical steps to get started today."),
    22: ("what-to-do-with-your-first-bch.html", "What to do with your first BCH", "You have BCH in your wallet. Now what? The simplest first spend, how to think about your stack, and why buying a sticker might be the best move you make today."),
    23: ("a-day-in-the-life-with-bch.html", "A day in the life with BCH", "What does it actually look like to use Bitcoin Cash every day? Coffee, rent, sending money to family, buying a sticker — a regular day with internet cash."),
    24: ("why-merchants-are-accepting-bch.html", "Why merchants are accepting BCH", "Lower fees, final settlement, no chargebacks, no middlemen. The business case for Bitcoin Cash is even stronger than the user case. Here is why shops are switching."),
    25: ("money-that-rules.html", "Money that rules", "Bitcoin Cash is not just a payment rail. Every coin is locked by a small program. Programmability starts with that fact — and it changes what money can do."),
    26: ("tokens-on-the-cash-layer.html", "Tokens on the cash layer", "CashTokens add divisible tokens and NFTs to BCH itself — not to a sidechain, not to a separate ledger. The fees are still paid in BCH."),
    27: ("nfts-with-the-receipt-built-in.html", "NFTs with the receipt built in", "A BCH NFT is not a link to a picture. It is a token with a small piece of data built in — a receipt, a ticket, or a checkable claim."),
    28: ("escrow-without-a-company.html", "Escrow without a company", "A shared-key setup or a small rule can hold funds until the conditions are met. The middleman becomes a key, not a company."),
    29: ("a-freelancer-paid-in-bch.html", "A freelancer paid in BCH", "A freelancer in Argentina invoices a client in the US. The payment settles in minutes, costs pennies, and no one needs a bank account or approval."),
    30: ("a-nonprofit-accepting-bch.html", "A nonprofit accepting BCH", "A small nonprofit accepts BCH donations. The money goes directly to their wallet, no platform fees, no chargebacks, and donors can verify where it went."),
    31: ("cross-border-remittances-with-bch.html", "Cross-border remittances with BCH", "A worker in the US sends money home to family in the Philippines. The payment settles in minutes, costs pennies, and no one needs a bank account or approval."),
    32: ("a-small-business-using-bch.html", "A small business using BCH for international trade", "A Vietnamese coffee exporter sells to a US roaster. The payment settles in minutes, costs pennies, and no one needs a bank account or approval."),
    33: ("online-creators-monetizing-with-bch.html", "Online creators monetizing with BCH", "A musician in Brazil sells directly to fans worldwide. The payments settle in minutes, cost pennies, and no platform takes a cut."),
    34: ("a-local-community-building-bch-commerce.html", "A local community building BCH commerce", "A neighborhood in El Salvador builds a local economy around BCH. Coffee shops, mechanics, and market vendors accept it. The community owns the payment rail."),
    35: ("emergency-aid-and-humanitarian-use-cases.html", "Bitcoin Cash is everywhere", "From freelancers to nonprofits, from coffee shops to disaster relief — people are accepting BCH every day. Here is the summary, and the next step."),
    36: ("the-future-of-internet-cash.html", "The future of internet cash", "The system broke. BCH is the fix. The world is already on board. The only question left is whether you will be part of what comes next."),
}

# Define chapter structure
CHAPTERS = {
    "preface": {"posts": [1], "title": "Preface", "subtitle": "The ground under your feet"},
    "part1": {
        "title": "The problem",
        "chapters": [
            {"posts": [2, 3, 4], "title": "Chapter one", "subtitle": "What they don't tell you about your dollar"},
            {"posts": [5, 6, 7], "title": "Chapter two", "subtitle": "The silent tax"},
        ]
    },
    "part2": {
        "title": "The solution",
        "chapters": [
            {"posts": [8, 9, 10], "title": "Chapter three", "subtitle": "The way out"},
            {"posts": [11, 12, 13], "title": "Chapter four", "subtitle": "How it actually works"},
            {"posts": [14, 15, 16], "title": "Chapter five", "subtitle": "Cheap, private, yours"},
            {"posts": [17, 18, 19], "title": "Chapter six", "subtitle": "Built to scale"},
        ]
    },
    "part3": {
        "title": "The revolution",
        "chapters": [
            {"posts": [20, 21, 22], "title": "Chapter seven", "subtitle": "Getting started"},
            {"posts": [23, 24, 25], "title": "Chapter eight", "subtitle": "Already in motion"},
            {"posts": [26, 27, 28], "title": "Chapter nine", "subtitle": "Money with rules"},
            {"posts": [29, 30, 31], "title": "Chapter ten", "subtitle": "Real-world use cases"},
            {"posts": [32, 33, 34], "title": "Chapter eleven", "subtitle": "Building the future"},
            {"posts": [35, 36], "title": "Chapter twelve", "subtitle": "The road ahead"},
        ]
    }
}

def update_blog_html():
    """Update the main blog.html file with new structure"""
    print("Updating blog.html...")
    
    # Read the file
    with open('/home/methuselah/Work/stickers-cash/blog.html', 'r') as f:
        content = f.read()
    
    # Update total post count (37 -> 36)
    content = content.replace('now in 37 posts', 'now in 36 posts')
    content = content.replace('37 posts', '36 posts')
    content = content.replace('thirty-seven posts', 'thirty-six posts')
    
    # Write back
    with open('/home/methuselah/Work/stickers-cash/blog.html', 'w') as f:
        f.write(content)
    
    print("✓ Updated blog.html")

def update_all_posts():
    """Update all individual post files with correct prev/next links"""
    print("\nUpdating individual post files...")
    
    for pos in range(1, 37):
        filename, title, desc = NEW_STRUCTURE[pos]
        filepath = f'/home/methuselah/Work/stickers-cash/blog/{filename}'
        
        with open(filepath, 'r') as f:
            content = f.read()
        
        # Update position in JSON-LD
        content = re.sub(
            r'"position":\s*\d+',
            f'"position": {pos}',
            content
        )
        
        # Update post number display
        content = re.sub(
            r'<span>Post \d+ of 37</span>',
            f'<span>Post {pos} of 36</span>',
            content
        )
        
        # Update announcement
        content = content.replace('now in 37 posts', 'now in 36 posts')
        
        # Determine prev/next
        prev_pos = pos - 1 if pos > 1 else None
        next_pos = pos + 1 if pos < 36 else None
        
        # Update prev link
        if prev_pos:
            prev_filename, prev_title, _ = NEW_STRUCTURE[prev_pos]
            # Find the prev pager card and update it
            content = re.sub(
                r'<a class="pager-card prev"[^>]*>.*?</a>',
                f'<a class="pager-card prev" href="{prev_filename}">\n<span>← Previous post</span>\n<b>{prev_title}</b>\n</a>',
                content,
                flags=re.DOTALL
            )
        else:
            # Remove prev link for post 1
            content = re.sub(
                r'<a class="pager-card prev"[^>]*>.*?</a>\s*',
                '',
                content,
                flags=re.DOTALL
            )
        
        # Update next link
        if next_pos:
            next_filename, next_title, _ = NEW_STRUCTURE[next_pos]
            content = re.sub(
                r'<a class="pager-card next"[^>]*>.*?</a>',
                f'<a class="pager-card next" href="{next_filename}">\n<span>Next post →</span>\n<b>{next_title}</b>\n</a>',
                content,
                flags=re.DOTALL
            )
        else:
            # Remove next link for last post
            content = re.sub(
                r'<a class="pager-card next"[^>]*>.*?</a>\s*',
                '',
                content,
                flags=re.DOTALL
            )
        
        # Update inline next-post button
        if next_pos:
            next_filename, next_title, _ = NEW_STRUCTURE[next_pos]
            content = re.sub(
                r'<a class="next-post-button"[^>]*>.*?</a>',
                f'<a class="next-post-button" href="{next_filename}">\n<span class="next-post-label">Next post →</span>\n<strong>{next_title}</strong>\n</a>',
                content,
                flags=re.DOTALL
            )
        
        with open(filepath, 'w') as f:
            f.write(content)
        
        print(f"✓ Updated post {pos}: {title}")

def main():
    print("=" * 60)
    print("Reorganizing blog posts")
    print("=" * 60)
    
    update_blog_html()
    update_all_posts()
    
    print("\n" + "=" * 60)
    print("Done! All posts reorganized.")
    print("=" * 60)

if __name__ == "__main__":
    main()
