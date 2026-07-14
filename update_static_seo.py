import glob
import os
import re

static_pages = {
    'about.html': 'About Us',
    'contact.html': 'Contact Us',
    'shipping.html': 'Shipping Policy',
    'returns.html': 'Returns & Exchanges',
    'privacy.html': 'Privacy Policy',
    'our-story.html': 'Our Story',
    'why-adrini.html': 'Why ADRINI',
    'all-collections.html': 'All Collections',
}

for filename, page_name in static_pages.items():
    if os.path.exists(filename):
        with open(filename, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Replace title
        content = re.sub(
            r'<title>.*?</title>',
            f'<title>{page_name} | ADRINI</title>',
            content
        )
        
        # Replace description
        content = re.sub(
            r'<meta name="description" content=".*?">',
            f'<meta name="description" content="Discover premium silk, cotton, Banarasi and Kerala sarees at ADRINI. Free shipping on all prepaid orders.">',
            content
        )
        
        # Replace OG Title
        content = re.sub(
            r'<meta property="og:title" content=".*?">',
            f'<meta property="og:title" content="{page_name} | ADRINI">',
            content
        )

        with open(filename, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {filename}")
