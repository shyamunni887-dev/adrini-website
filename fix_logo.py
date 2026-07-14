import os
import glob
import re

for file in glob.glob("*.html"):
    with open(file, "r") as f:
        content = f.read()
        
    # Fix desktop logo
    content = re.sub(
        r'<a href="(/|index\.html)" class="lm-nav-logo"[^>]*>.*?<img[^>]*>.*?<span>Timeless Indian Elegance</span>.*?</a>',
        r'<a href="\1" class="lm-nav-logo">\n            <h1>ADRINI</h1>\n            <span>Timeless Indian Elegance</span>\n        </a>',
        content,
        flags=re.DOTALL
    )
    
    # Fix mobile logo
    content = re.sub(
        r'<div class="lm-mn-logo"><img[^>]*></div>',
        r'<div class="lm-mn-logo">ADRINI</div>',
        content
    )
    
    with open(file, "w") as f:
        f.write(content)

print("Done replacing logos")
