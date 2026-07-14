import os

directory = '/Users/shyam/Documents/adrini.com'
for root, dirs, files in os.walk(directory):
    for file in files:
        if file.endswith('.html'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r') as f:
                content = f.read()
            if "onclick=\"window.location.href='account.html'\"" in content:
                new_content = content.replace(" onclick=\"window.location.href='account.html'\"", "")
                with open(filepath, 'w') as f:
                    f.write(new_content)
                print(f"Fixed {filepath}")
