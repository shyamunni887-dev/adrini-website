import glob
import re

html_files = glob.glob('**/*.html', recursive=True)
count = 0

for filename in html_files:
    try:
        with open(filename, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Regex to remove lines containing lm-trust-impact or tc-impact
        new_content = re.sub(r'\s*<span class="(lm-)?trust-impact.*</span>', '', content)
        new_content = re.sub(r'\s*<span class="tc-impact.*</span>', '', new_content)
        
        if new_content != content:
            with open(filename, 'w', encoding='utf-8') as f:
                f.write(new_content)
            count += 1
            print(f"Updated {filename}")
    except Exception as e:
        print(f"Skipping {filename}: {e}")

print(f"Updated {count} files")
