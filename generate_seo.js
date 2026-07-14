const fs = require('fs');

const SHOPIFY_URL = "https://adrini-5666.myshopify.com/api/2024-01/graphql.json";
const TOKEN = "5a869208a525680f7f1f91e2d8b20a97";

const query = `
{
  products(first: 250) {
    edges { node { handle updatedAt } }
  }
  collections(first: 50) {
    edges { node { handle updatedAt } }
  }
}`;

const staticPages = [
    { page: "index.html", priority: "1.0", freq: "daily" },
    { page: "all-collections.html", priority: "0.8", freq: "weekly" },
    { page: "about.html", priority: "0.5", freq: "monthly" },
    { page: "contact.html", priority: "0.5", freq: "monthly" },
    { page: "our-story.html", priority: "0.5", freq: "monthly" },
    { page: "privacy.html", priority: "0.3", freq: "yearly" },
    { page: "returns.html", priority: "0.3", freq: "yearly" },
    { page: "shipping.html", priority: "0.3", freq: "yearly" },
    { page: "why-adrini.html", priority: "0.5", freq: "monthly" }
];

async function generate() {
    try {
        console.log("Fetching data from Shopify for SEO generation...");
        const res = await fetch(SHOPIFY_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Shopify-Storefront-Access-Token': TOKEN
            },
            body: JSON.stringify({ query })
        });
        
        if (!res.ok) throw new Error("Shopify API Error: " + res.statusText);
        const data = await res.json();
        
        const products = data.data.products.edges;
        const collections = data.data.collections.edges;
        const today = new Date().toISOString().split('T')[0];
        
        // 1. Generate products.xml
        let pXml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
        for (const p of products) {
            const date = p.node.updatedAt.substring(0, 10);
            pXml += `  <url>\n    <loc>https://adrini.com/products/${p.node.handle}</loc>\n    <lastmod>${date}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.9</priority>\n  </url>\n`;
        }
        pXml += '</urlset>';
        fs.writeFileSync('products.xml', pXml);
        console.log("Generated products.xml");

        // 2. Generate collections.xml
        let cXml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
        for (const c of collections) {
            const date = c.node.updatedAt.substring(0, 10);
            cXml += `  <url>\n    <loc>https://adrini.com/collection.html?handle=${c.node.handle}</loc>\n    <lastmod>${date}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
        }
        cXml += '</urlset>';
        fs.writeFileSync('collections.xml', cXml);
        console.log("Generated collections.xml");
        
        // 3. Generate static.xml
        let stXml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
        for (const sp of staticPages) {
            const loc = sp.page === 'index.html' ? 'https://adrini.com/' : `https://adrini.com/${sp.page}`;
            stXml += `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${sp.freq}</changefreq>\n    <priority>${sp.priority}</priority>\n  </url>\n`;
        }
        stXml += '</urlset>';
        fs.writeFileSync('static.xml', stXml);
        console.log("Generated static.xml");
        
        // 4. Generate sitemap.xml (Index)
        let sXml = '<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
        sXml += `  <sitemap>\n    <loc>https://adrini.com/products.xml</loc>\n    <lastmod>${today}</lastmod>\n  </sitemap>\n`;
        sXml += `  <sitemap>\n    <loc>https://adrini.com/collections.xml</loc>\n    <lastmod>${today}</lastmod>\n  </sitemap>\n`;
        sXml += `  <sitemap>\n    <loc>https://adrini.com/static.xml</loc>\n    <lastmod>${today}</lastmod>\n  </sitemap>\n`;
        sXml += '</sitemapindex>\n';
        fs.writeFileSync('sitemap.xml', sXml);
        console.log("Generated sitemap.xml");
        
        // 5. Generate robots.txt
        const robots = `User-agent: *\nAllow: /\n\nSitemap: https://adrini.com/sitemap.xml\n`;
        fs.writeFileSync('robots.txt', robots);
        console.log("Generated robots.txt");
        
        console.log("SEO files successfully generated!");
    } catch (err) {
        console.error("Failed to generate SEO files:", err);
        process.exit(1);
    }
}

generate();
