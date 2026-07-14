import glob

def main():
    html_files = glob.glob('**/*.html', recursive=True)
    for filename in html_files:
        with open(filename, 'r', encoding='utf-8') as f:
            content = f.read()
        
        old_link = '<a href="#" class="lm-footer-link">About Adrini</a>'
        new_link = '<a href="about.html" class="lm-footer-link">About Adrini</a>'
        
        if old_link in content:
            content = content.replace(old_link, new_link)
            with open(filename, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Updated About Adrini link in {filename}")

if __name__ == "__main__":
    main()
