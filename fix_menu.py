import glob
import re

# Read index.html to get the correct menu
with open('index.html', 'r') as f:
    index_content = f.read()

# Extract the menu block using a regex that captures everything from <div id="mobile-nav" ... to the closing </div> after the premium footer
match = re.search(r'(<div id="mobile-nav" class="lm-mobile-nav" data-lenis-prevent>.*?<div class="lm-mobile-nav-premium-footer">.*?</div>\s*</div>)', index_content, re.DOTALL)
if not match:
    print("Could not find the menu block in index.html!")
    exit(1)

correct_menu = match.group(1)
print(f"Extracted menu block of length {len(correct_menu)}")

html_files = glob.glob('*.html')
for filepath in html_files:
    if filepath == 'index.html':
        continue
        
    with open(filepath, 'r') as f:
        content = f.read()
        
    # Replace the existing menu block
    # It might have data-lenis-prevent or not, so we match just <div id="mobile-nav" class="lm-mobile-nav"
    new_content = re.sub(
        r'<div id="mobile-nav" class="lm-mobile-nav"[^>]*>.*?<div class="lm-mobile-nav-premium-footer">.*?</div>\s*</div>',
        correct_menu,
        content,
        flags=re.DOTALL
    )
    
    if new_content != content:
        with open(filepath, 'w') as f:
            f.write(new_content)
        print(f"Updated {filepath}")
    else:
        print(f"No changes made to {filepath} (maybe already updated or format mismatch)")

print("Done.")
