import glob

old_id = "G-H3K9IMTB0L"
new_id = "G-HSK91WTB0L"

for filepath in glob.glob('*.html'):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if old_id in content:
        content = content.replace(old_id, new_id)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated GA in {filepath}")
