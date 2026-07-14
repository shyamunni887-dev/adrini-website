"""
Add data-stagger attribute and fade-up to section heading wrappers
to enhance scroll animations across the site.
"""
import re
import glob

REPLACEMENTS = {
    # index.html – trust bar, section headings 
    'index.html': [
        (
            '<div class="lm-trust-bar">',
            '<div class="lm-trust-bar" data-stagger>'
        ),
        (
            '<div class="lm-products-header">',
            '<div class="lm-products-header fade-up">'
        ),
    ],
    # about.html – values grid, why section
    'about.html': [
        (
            '<div class="lm-about-values-grid">',
            '<div class="lm-about-values-grid" data-stagger>'
        ),
        (
            '<div class="lm-about-story fade-up">',
            '<div class="lm-about-story fade-up">'  # already has it
        ),
    ],
    # contact.html – contact cards
    'contact.html': [
        (
            '<div class="lm-contact-cards">',
            '<div class="lm-contact-cards" data-stagger>'
        ),
    ],
    # returns.html – trust strip
    'returns.html': [
        (
            '<div class="lm-returns-trust">',
            '<div class="lm-returns-trust" data-stagger>'
        ),
    ],
    # privacy.html – trust strip
    'privacy.html': [
        (
            '<div class="lm-returns-trust">',
            '<div class="lm-returns-trust" data-stagger>'
        ),
    ],
}

changed = 0
for filename, pairs in REPLACEMENTS.items():
    try:
        with open(filename, 'r', encoding='utf-8') as f:
            content = f.read()
        new_content = content
        for old, new in pairs:
            if old in new_content and old != new:
                new_content = new_content.replace(old, new, 1)
                print(f"  {filename}: replaced '{old[:50]}'")
                changed += 1
        if new_content != content:
            with open(filename, 'w', encoding='utf-8') as f:
                f.write(new_content)
    except FileNotFoundError:
        print(f"  Skipping {filename} (not found)")

print(f"\nDone. {changed} replacements made.")
