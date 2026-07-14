import glob

def main():
    # Update whatsapp across all files
    html_files = glob.glob('**/*.html', recursive=True)
    for filename in html_files:
        with open(filename, 'r', encoding='utf-8') as f:
            content = f.read()
        
        old_wa = 'https://wa.me/919999999999'
        new_wa = 'https://wa.me/917356510301'
        
        if old_wa in content:
            content = content.replace(old_wa, new_wa)
            with open(filename, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Updated WhatsApp in {filename}")
            
    # Update address in contact.html
    with open('contact.html', 'r', encoding='utf-8') as f:
        contact = f.read()
    
    old_addr = 'ADRINI Sarees<br>Kollam, Kerala, India'
    new_addr = 'ADRINI Sarees<br>Shyam Nivas, Naduvilakkara<br>Alummoodu P O, Kollam<br>PIN 691576, Kerala, India'
    
    if old_addr in contact:
        contact = contact.replace(old_addr, new_addr)
        with open('contact.html', 'w', encoding='utf-8') as f:
            f.write(contact)
        print("Updated Address in contact.html")

if __name__ == "__main__":
    main()
