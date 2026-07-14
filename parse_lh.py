import json

def parse_report(file_path):
    with open(file_path, 'r') as f:
        data = json.load(f)
    
    cats = data['categories']
    audits = data['audits']
    
    perf = cats['performance']['score'] * 100
    acc = cats['accessibility']['score'] * 100
    bp = cats['best-practices']['score'] * 100
    seo = cats['seo']['score'] * 100
    
    fcp = audits['first-contentful-paint']['displayValue']
    lcp = audits['largest-contentful-paint']['displayValue']
    tbt = audits['total-blocking-time']['displayValue']
    cls = audits['cumulative-layout-shift']['displayValue']
    
    # INP might not be directly available in standard audits under 'interaction-to-next-paint', 
    # but we can look for 'interactive' or 'max-potential-fid' as a proxy if INP is missing.
    inp = audits.get('interaction-to-next-paint', {}).get('displayValue', 'N/A')
    
    print(f"Performance: {perf:.0f}")
    print(f"Accessibility: {acc:.0f}")
    print(f"Best Practices: {bp:.0f}")
    print(f"SEO: {seo:.0f}")
    print(f"FCP: {fcp}")
    print(f"LCP: {lcp}")
    print(f"TBT: {tbt}")
    print(f"CLS: {cls}")
    print(f"INP: {inp}")

print("--- MOBILE ---")
try:
    parse_report('lighthouse-mobile.json')
except Exception as e:
    print(e)
