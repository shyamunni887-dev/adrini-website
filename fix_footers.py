import glob

old_block = """        <div>
            <div class="lm-footer-col-title">Shop</div>
            <div class="lm-footer-links">
                <a href="#" class="lm-footer-link" onclick="event.preventDefault(); sessionStorage.setItem('lm-collection-handle','kalyani-cotton'); window.location.href='collection.html'">Kalyani Cotton</a>
                <a href="#" class="lm-footer-link" onclick="event.preventDefault(); sessionStorage.setItem('lm-collection-handle','mul-cotton'); window.location.href='collection.html'">Mul Cotton</a>
                <a href="#" class="lm-footer-link" onclick="event.preventDefault(); sessionStorage.setItem('lm-collection-handle','kadhi-cotton'); window.location.href='collection.html'">Khadi Cotton</a>
                <a href="#" class="lm-footer-link" onclick="event.preventDefault(); sessionStorage.setItem('lm-collection-handle','banarasi'); window.location.href='collection.html'">Banarasi</a>
            </div>
        </div>"""

new_block = """        <div>
            <div class="lm-footer-col-title">Shop</div>
            <div class="lm-footer-links" id="footer-collections-list">
                <!-- Injected via JS -->
            </div>
        </div>"""

for file in glob.glob('*.html'):
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if old_block in content:
        content = content.replace(old_block, new_block)
        with open(file, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {file}")
    else:
        print(f"Skipped {file}")
