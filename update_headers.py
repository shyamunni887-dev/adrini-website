import re
import glob

# Read index.html to get the master header
with open('index.html', 'r', encoding='utf-8') as f:
    index_content = f.read()

# We need to extract from <header id="main-header" up to the end of <div id="mobile-nav"
header_start = index_content.find('<header id="main-header"')
nav_start = index_content.find('<div id="mobile-nav"', header_start)

# Count divs to find the end of mobile-nav
div_count = 0
nav_end = -1
for i in range(nav_start, len(index_content)):
    if index_content[i:i+4] == '<div':
        div_count += 1
    elif index_content[i:i+6] == '</div>':
        div_count -= 1
        if div_count == 0:
            nav_end = i + 6
            break

master_header = index_content[header_start:nav_end]
print(f"Extracted master header block of length {len(master_header)}")

html_files = [f for f in glob.glob('*.html') if f != 'index.html']
files_updated = 0

for file in html_files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    tgt_header_start = content.find('<header id="main-header"')
    if tgt_header_start == -1:
        print(f"Skipping {file}, no header found.")
        continue
        
    tgt_nav_start = content.find('<div id="mobile-nav"', tgt_header_start)
    if tgt_nav_start == -1:
        print(f"Skipping {file}, no mobile-nav found.")
        continue
        
    div_count = 0
    tgt_nav_end = -1
    for i in range(tgt_nav_start, len(content)):
        if content[i:i+4] == '<div':
            div_count += 1
        elif content[i:i+6] == '</div>':
            div_count -= 1
            if div_count == 0:
                tgt_nav_end = i + 6
                break
                
    if tgt_nav_end != -1:
        new_content = content[:tgt_header_start] + master_header + content[tgt_nav_end:]
        with open(file, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {file}")
        files_updated += 1
    else:
        print(f"Failed to find end of mobile-nav in {file}")

print(f"Successfully updated {files_updated} files.")
