import os

directory = '.'

for root, dirs, files in os.walk(directory):
    if '.git' in root or 'node_modules' in root or '.netlify' in root:
        continue
    for file in files:
        if file.endswith('.html') or file.endswith('.js'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r') as f:
                content = f.read()
            
            new_content = content.replace("'products/", "'/products/")
            new_content = new_content.replace("\"products/", "\"/products/")
            
            if new_content != content:
                with open(filepath, 'w') as f:
                    f.write(new_content)
                print(f"Updated {filepath}")
