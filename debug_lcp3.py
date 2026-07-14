import json

with open('lighthouse-mobile.json', 'r') as f:
    data = json.load(f)

print(json.dumps(data['audits'].get('largest-contentful-paint', {}), indent=2))
