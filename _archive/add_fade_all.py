import glob
import re

html_files = glob.glob('**/*.html', recursive=True)
count = 0

for filename in html_files:
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find all <section> tags
    def add_fade(match):
        global count
        tag = match.group(0)
        # If it doesn't have fade-up, add it
        if 'fade-up' not in tag and 'fade-down' not in tag:
            count += 1
            if 'class="' in tag:
                return tag.replace('class="', 'class="fade-up ')
            else:
                return tag.replace('<section', '<section class="fade-up"')
        return tag

    new_content = re.sub(r'<section[^>]*>', add_fade, content)

    if new_content != content:
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {filename}")

print(f"Added fade-up to {count} sections")
