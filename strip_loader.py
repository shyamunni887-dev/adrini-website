import os
import glob

html_files = glob.glob("*.html")
html_files = [f for f in html_files if f not in ["index.html", "all-collections.html"]] # Wait, does all-collections have it? Let's strip from all except index.html

for file in html_files:
    with open(file, 'r') as f:
        content = f.read()
    
    # Simple replace logic
    loader_str = '''<!-- ══ LOADER ═══════════════════════════════════════════════════════════════ -->
<div id="loader" class="loader-overlay">
    <div class="loader-content">
        <span class="loader-brand">ADRINI</span>
        <div class="loader-bar"></div>
    </div>
</div>'''
    
    loader_str2 = '''<div id="loader" class="loader-overlay">
    <div class="loader-content">
        <span class="loader-brand">ADRINI</span>
        <div class="loader-bar"></div>
    </div>
</div>'''
    
    if loader_str in content:
        content = content.replace(loader_str, "")
        with open(file, 'w') as f:
            f.write(content)
        print(f"Stripped loader from {file}")
    elif loader_str2 in content:
        content = content.replace(loader_str2, "")
        with open(file, 'w') as f:
            f.write(content)
        print(f"Stripped loader without comments from {file}")
        
