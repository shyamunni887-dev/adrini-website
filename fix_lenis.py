import os
import glob

html_files = glob.glob('*.html')

for filepath in html_files:
    with open(filepath, 'r') as f:
        content = f.read()

    # Replace for cart-items
    content = content.replace('<div id="cart-items" class="cart-items">', '<div id="cart-items" class="cart-items" data-lenis-prevent>')
    
    # Replace for wishlist-items
    content = content.replace('<div id="wishlist-items" class="cart-items">', '<div id="wishlist-items" class="cart-items" data-lenis-prevent>')
    
    # Replace for cart-rec-items if it's scrollable? Actually cart-rec-items is inside cart-recommendations which doesn't have overflow auto.
    
    with open(filepath, 'w') as f:
        f.write(content)

print("Done replacing.")
