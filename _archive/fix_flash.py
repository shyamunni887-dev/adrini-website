import re

def fix_image_flash(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()

    # The transparent 1x1 gif
    placeholder = 'src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"'

    # Replace hardcoded image sources with placeholder
    # We only want to replace the large product images (Kasavu Saree View etc.)
    # Let's target the known src attributes.
    targets = [
        'src="images/01.jpg"',
        'src="images/banarasi_silk.jpg"',
        'src="images/kalyani_cotton.jpg"',
        'src="images/khadi_cotton.jpg"'
    ]

    for target in targets:
        # Only replace if it's in the main product viewer or similar products block.
        # But honestly, replacing all of them in product.html is fine since product.html shouldn't have hardcoded static images except for the actual product placeholders.
        # Wait, product.html doesn't use these images anywhere else besides the placeholders!
        content = content.replace(target, placeholder)

    with open(filename, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Fixed image flash in {filename}")

if __name__ == "__main__":
    fix_image_flash('product.html')
    fix_image_flash('01/product.html')
