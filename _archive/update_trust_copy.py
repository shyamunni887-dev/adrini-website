import glob
import re

html_files = glob.glob('**/*.html', recursive=True)
count = 0

for filename in html_files:
    try:
        with open(filename, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # 1. Trust header
        content = content.replace('Why Adrini', 'WHY ADRINI')
        content = content.replace('Every reason to trust us', 'Shop With Confidence')
        
        # 2. Add 4th trust card
        cod_card = '''<div class="lm-trust-card reveal">
            <span class="lm-trust-icon">📦</span>
            <div class="lm-trust-card-title">COD available</div>
            <div class="lm-trust-card-body">Pay when it arrives at your door. No risk, no upfront payment required.</div>
        </div>'''
        
        new_card = '''<div class="lm-trust-card reveal">
            <span class="lm-trust-icon">📦</span>
            <div class="lm-trust-card-title">Secure Packaging</div>
            <div class="lm-trust-card-body">Carefully packed to arrive in perfect condition.</div>
        </div>'''
        
        # In case the COD card has exact matching, let's use regex
        content = re.sub(
            r'(<div class="lm-trust-card reveal">\s*<span class="lm-trust-icon">📦</span>\s*<div class="lm-trust-card-title">COD available</div>\s*<div class="lm-trust-card-body">.*?</div>\s*</div>)',
            r'\1\n        ' + new_card,
            content,
            flags=re.DOTALL
        )
        
        # 3. WhatsApp section
        content = content.replace('<h2 class="lm-wa-title">Have a question? Chat with us.</h2>', '<div class="lm-wa-title" style="font-size: 14px; font-style: normal; font-family: \'Outfit\', sans-serif; letter-spacing: 2px; text-transform: uppercase; color: #c9943a; font-weight: 500; margin-bottom: 12px;">Need Help Choosing?</div>\n        <h2 class="lm-wa-title">Chat with us.</h2>')
        
        # 4. Newsletter
        content = content.replace('Get ₹200 off your first order', 'Enjoy ₹200 Off Your First Adrini Saree')
        
        if content != original_content:
            with open(filename, 'w', encoding='utf-8') as f:
                f.write(content)
            count += 1
            print(f"Updated {filename}")
    except Exception as e:
        print(f"Skipping {filename}: {e}")

print(f"Updated {count} files")
