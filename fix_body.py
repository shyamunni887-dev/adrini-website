import glob

html_files = glob.glob("*.html")
for file in html_files:
    with open(file, 'r') as f:
        content = f.read()
    
    if '<body class="pg">' in content:
        content = content.replace('<body class="pg">', '<body class="pg" style="background: #f8f4ec; margin: 0;">')
    elif '<body>' in content:
        content = content.replace('<body>', '<body style="background: #f8f4ec; margin: 0;">')
        
    with open(file, 'w') as f:
        f.write(content)
    print(f"Fixed body in {file}")

