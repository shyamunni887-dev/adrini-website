import glob

# The line to look for (approximately)
# <a href="#" class="lm-footer-social-btn" data-label="Instagram"
# or similar. We can just replace:
# href="#" class="lm-footer-social-btn" data-label="Instagram"
# with:
# href="https://www.instagram.com/adrini.official/" class="lm-footer-social-btn" data-label="Instagram" target="_blank"

for filepath in glob.glob('*.html'):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    modified = False
    
    if 'data-label="Instagram"' in content:
        # We might have href="#" or href=""
        if 'href="#" class="lm-footer-social-btn" data-label="Instagram"' in content:
            content = content.replace(
                'href="#" class="lm-footer-social-btn" data-label="Instagram"',
                'href="https://www.instagram.com/adrini.official/" class="lm-footer-social-btn" data-label="Instagram" target="_blank"'
            )
            modified = True
            
    if modified:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {filepath}")
        
