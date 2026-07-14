import os
import glob

html_files = glob.glob('*.html')

mobile_logo_search = '<div class="lm-mn-logo">ADRINI</div>'
mobile_logo_replace = '<div class="lm-mn-logo"><img src="/images/logo.png" alt="ADRINI Logo" style="height: 35px; width: auto; mix-blend-mode: multiply;"></div>'

desktop_logo_search = """        <!-- Centre: Logo -->
        <a href="index.html" class="lm-nav-logo">
            <span style="font-family: 'Playfair Display', serif; font-size: 24px; font-weight: 500; letter-spacing: 0.1em; color: #1a1208; line-height: 1.2;">ADRINI</span>
            <span>Timeless Indian Elegance</span>
        </a>"""

desktop_logo_replace = """        <!-- Centre: Logo -->
        <a href="/" class="lm-nav-logo" style="display: flex; flex-direction: column; align-items: center; justify-content: center; text-decoration: none;">
            <img src="/images/logo.png" alt="ADRINI Logo" style="height: 70px; width: auto; mix-blend-mode: multiply; margin-bottom: 2px;">
            <span>Timeless Indian Elegance</span>
        </a>"""

for file_path in html_files:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    content = content.replace(mobile_logo_search, mobile_logo_replace)
    
    # Also handle href="/" case for desktop logo if it was changed
    desktop_logo_search_root = desktop_logo_search.replace('href="index.html"', 'href="/"')
    
    content = content.replace(desktop_logo_search, desktop_logo_replace)
    content = content.replace(desktop_logo_search_root, desktop_logo_replace)
    
    if content != original_content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {file_path}")
    
