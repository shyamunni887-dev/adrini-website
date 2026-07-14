import glob

def main():
    html_files = glob.glob('**/*.html', recursive=True)
    for filename in html_files:
        with open(filename, 'r', encoding='utf-8') as f:
            content = f.read()
        
        old_link = '<a href="#" class="lm-footer-link">Shipping policy</a>'
        new_link = '<a href="shipping.html" class="lm-footer-link">Shipping policy</a>'
        
        if old_link in content:
            content = content.replace(old_link, new_link)
            with open(filename, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Updated Shipping Policy link in {filename}")

if __name__ == "__main__":
    main()
