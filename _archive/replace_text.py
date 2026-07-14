import glob

html_files = glob.glob('**/*.html', recursive=True)
count = 0

for filename in html_files:
    try:
        with open(filename, 'r', encoding='utf-8') as f:
            content = f.read()
        
        if 'Join 2,000+ women' in content:
            new_content = content.replace('Join 2,000+ women', 'Join the Adrini Community')
            with open(filename, 'w', encoding='utf-8') as f:
                f.write(new_content)
            count += 1
            print(f"Updated {filename}")
    except Exception as e:
        print(f"Skipping {filename}: {e}")

print(f"Updated {count} files")
