import glob
import re

for filepath in glob.glob('*.html'):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Simple regex to find img tags and add loading="lazy" if not present
    # This is a basic string replacement logic
    def replace_img(match):
        img_tag = match.group(0)
        if 'loading=' not in img_tag:
            # insert loading="lazy" before the closing bracket
            return img_tag.replace('>', ' loading="lazy">')
        return img_tag

    new_content = re.sub(r'<img[^>]+>', replace_img, content)
    
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Added lazy loading to images in {filepath}")
