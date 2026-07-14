import json
with open('lighthouse-mobile.json') as f:
    data = json.load(f)

for k in data['audits'].keys():
    if 'lcp' in k.lower() or 'largest' in k.lower():
        print(k)

