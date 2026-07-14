import re

with open('critical.css', 'r') as f:
    critical_css = f.read()

with open('index.html', 'r') as f:
    html = f.read()

# Inline critical CSS
style_tag = f'<style>{critical_css}</style>'
html = html.replace('<!-- CSS -->', f'<!-- CSS -->\n    {style_tag}')

# Defer index.css
old_css_link = '<link rel="stylesheet" href="/src/styles/index.css">'
new_css_link = '<link rel="preload" as="style" href="/src/styles/index.css" onload="this.onload=null;this.rel=\'stylesheet\'"><noscript><link rel="stylesheet" href="/src/styles/index.css"></noscript>'

html = html.replace(old_css_link, new_css_link)

with open('index.html', 'w') as f:
    f.write(html)
print("Inlined critical CSS and deferred index.css")
