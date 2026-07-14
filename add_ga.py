import glob

ga_snippet = """<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-H3K9IMTB0L"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-H3K9IMTB0L');
</script>
</head>"""

for filepath in glob.glob('*.html'):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if 'www.googletagmanager.com/gtag' not in content:
        content = content.replace('</head>', ga_snippet)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Added GA to {filepath}")
    else:
        print(f"GA already exists in {filepath}")
