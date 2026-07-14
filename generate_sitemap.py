import requests
import json
from datetime import datetime

url = "https://adrini-5666.myshopify.com/api/2024-01/graphql.json"
headers = {
    "Content-Type": "application/json",
    "X-Shopify-Storefront-Access-Token": "5a869208a525680f7f1f91e2d8b20a97"
}

query = """
{
  products(first: 250) {
    edges {
      node {
        handle
        updatedAt
      }
    }
  }
  collections(first: 50) {
    edges {
      node {
        handle
        updatedAt
      }
    }
  }
}
"""

response = requests.post(url, headers=headers, json={"query": query})
data = response.json()

products = data["data"]["products"]["edges"]
collections = data["data"]["collections"]["edges"]

sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n'
sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'

# Add static pages
static_pages = [
    ("index.html", "1.0", "daily"),
    ("all-collections.html", "0.8", "weekly"),
    ("about.html", "0.5", "monthly"),
    ("contact.html", "0.5", "monthly"),
    ("our-story.html", "0.5", "monthly"),
    ("privacy.html", "0.3", "yearly"),
    ("returns.html", "0.3", "yearly"),
    ("shipping.html", "0.3", "yearly"),
    ("why-adrini.html", "0.5", "monthly")
]

today = datetime.today().strftime('%Y-%m-%d')

for page, priority, changefreq in static_pages:
    loc = "https://adrini.com/" if page == "index.html" else f"https://adrini.com/{page}"
    sitemap += f"  <url>\n    <loc>{loc}</loc>\n    <lastmod>{today}</lastmod>\n    <changefreq>{changefreq}</changefreq>\n    <priority>{priority}</priority>\n  </url>\n"

# Add products
for edge in products:
    handle = edge["node"]["handle"]
    updated_at = edge["node"]["updatedAt"][:10]
    sitemap += f"  <url>\n    <loc>https://adrini.com/products/{handle}</loc>\n    <lastmod>{updated_at}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.9</priority>\n  </url>\n"

# Add collections
for edge in collections:
    handle = edge["node"]["handle"]
    updated_at = edge["node"]["updatedAt"][:10]
    sitemap += f"  <url>\n    <loc>https://adrini.com/collection.html?handle={handle}</loc>\n    <lastmod>{updated_at}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n"

sitemap += '</urlset>'

with open("sitemap.xml", "w") as f:
    f.write(sitemap)

print("sitemap.xml generated successfully.")
