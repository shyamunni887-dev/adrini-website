import glob
import re

html_files = glob.glob('**/*.html', recursive=True)
count = 0

for filename in html_files:
    try:
        with open(filename, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # 1. Update product-card attributes
        content = re.sub(
            r'(<div class="product-card" [^>]*?)(>)',
            lambda m: m.group(1) + ' shopify-attr--data-title="product.title" shopify-attr--data-price="product.selectedOrFirstAvailableVariant.price.amount" shopify-attr--data-inventory="product.selectedOrFirstAvailableVariant.quantityAvailable" shopify-attr--data-type="product.productType" shopify-attr--data-tags="product.tags"' + m.group(2) if 'shopify-attr--data-title=' not in m.group(1) else m.group(0),
            content
        )

        # 2. Clear .card-tags content
        content = re.sub(
            r'<div class="card-tags">.*?</div>',
            r'<div class="card-tags"></div>',
            content,
            flags=re.DOTALL
        )
        
        if content != original_content:
            with open(filename, 'w', encoding='utf-8') as f:
                f.write(content)
            count += 1
            print(f"Updated {filename}")
    except Exception as e:
        print(f"Skipping {filename}: {e}")

print(f"Updated {count} files")
