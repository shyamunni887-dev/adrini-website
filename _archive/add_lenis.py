import glob
import re

html_files = glob.glob('**/*.html', recursive=True)
lenis_script = '<script src="https://unpkg.com/lenis@1.1.2/dist/lenis.min.js"></script>'

for filename in html_files:
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if 'lenis.min.js' not in content:
        # regex to find the main.js script tag
        content = re.sub(
            r'(<script src="[^"]*main\.js[^"]*"></script>)',
            lenis_script + r'\n    \1',
            content
        )
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Added Lenis to {filename}")
