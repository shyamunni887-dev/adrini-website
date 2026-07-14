import json

with open('lighthouse-mobile.json', 'r') as f:
    data = json.load(f)

# LCP Element
print("--- LCP ELEMENT ---")
lcp_elem = data['audits'].get('largest-contentful-paint-element', {})
if 'details' in lcp_elem and 'items' in lcp_elem['details']:
    items = lcp_elem['details']['items']
    for item in items:
        if 'node' in item:
            print(item['node']['snippet'])
        else:
            print("No node info")
else:
    print("LCP Element details not found")

# Render Blocking Resources
print("\n--- RENDER BLOCKING RESOURCES ---")
rbr = data['audits'].get('render-blocking-resources', {})
if 'details' in rbr and 'items' in rbr['details']:
    items = rbr['details']['items']
    if len(items) == 0:
        print("None!")
    for item in items:
        print(f"URL: {item.get('url', 'Unknown')}, Wasted Ms: {item.get('wastedMs', 0)}")
else:
    print("None or details not found")

# Network Requests
print("\n--- NETWORK WATERFALL (Top 10) ---")
network = data['audits'].get('network-requests', {})
if 'details' in network and 'items' in network['details']:
    items = network['details']['items']
    for item in items[:10]:
        url = item.get('url', '').split('/')[-1]
        print(f"File: {url} | MimeType: {item.get('mimeType')} | StartTime: {item.get('startTime', 0):.2f} | EndTime: {item.get('endTime', 0):.2f} | Size: {item.get('resourceSize', 0)}")

