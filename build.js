import fs from 'fs';
import path from 'path';

const STORE_DOMAIN = 'adrini-5666.myshopify.com';
const API_URL = `https://${STORE_DOMAIN}/api/2024-01/graphql.json`;
const ACCESS_TOKEN = '5a869208a525680f7f1f91e2d8b20a97';
const SITE_URL = 'https://adrini.com';

const FETCH_PRODUCTS_QUERY = `
  query {
    products(first: 250) {
      edges {
        node {
          title
          handle
          descriptionHtml
          seo { title description }
          images(first: 1) { edges { node { url(transform: {maxWidth: 1200}) } } }
          variants(first: 1) {
            edges {
              node {
                price { amount currencyCode }
                availableForSale
              }
            }
          }
        }
      }
    }
  }
`;

const FETCH_COLLECTIONS_QUERY = `
  query {
    collections(first: 250) {
      edges {
        node {
          title
          handle
          descriptionHtml
          seo { title description }
          image { url }
        }
      }
    }
  }
`;

async function fetchGraphQL(query) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': ACCESS_TOKEN,
    },
    body: JSON.stringify({ query }),
  });
  return response.json();
}

function truncateString(str, num) {
  if (str.length <= num) {
    return str;
  }
  return str.slice(0, num) + '...';
}

function stripHtml(html) {
  return html ? html.replace(/<[^>]*>?/gm, '').trim() : '';
}

async function build() {
  console.log('Fetching products and collections...');
  const [productsData, collectionsData] = await Promise.all([
    fetchGraphQL(FETCH_PRODUCTS_QUERY),
    fetchGraphQL(FETCH_COLLECTIONS_QUERY)
  ]);

  const products = productsData.data.products.edges.map(e => e.node);
  const collections = collectionsData.data.collections.edges.map(e => e.node);

  const productTemplate = fs.readFileSync('product.html', 'utf8');
  const collectionTemplate = fs.readFileSync('collection.html', 'utf8');

  // Directories for clean URLs
  if (!fs.existsSync('products')) fs.mkdirSync('products');
  if (!fs.existsSync('collections')) fs.mkdirSync('collections');

  let sitemapUrls = [];
  
  // Add static pages to sitemap
  const staticPages = ['', 'all-collections', 'about', 'contact', 'shipping', 'returns', 'privacy', 'our-story', 'why-adrini'];
  staticPages.forEach(page => {
    const urlPath = page === '' ? '' : `${page}.html`;
    sitemapUrls.push(`<url><loc>${SITE_URL}/${urlPath}</loc><changefreq>weekly</changefreq></url>`);
  });

  console.log('Generating product pages...');
  for (const product of products) {
    const dir = path.join('products', product.handle);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const title = `${product.title} | ADRINI`;
    const description = `Shop ${product.title} at ADRINI. Premium quality sarees with secure payments, fast delivery across India.`;
    const canonical = `${SITE_URL}/products/${product.handle}`;
    const imgUrl = product.images.edges[0]?.node?.url || `${SITE_URL}/images/desktop_hero.webp`;
    const price = product.variants.edges[0]?.node?.price?.amount || '0';
    const availability = product.variants.edges[0]?.node?.availableForSale ? 'InStock' : 'OutOfStock';

    const cleanTitle = title.replace(/"/g, '&quot;');
    const cleanDesc = truncateString(description.replace(/"/g, '&quot;'), 160);

    const jsonLd = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Product",
          "name": product.title,
          "image": imgUrl,
          "description": cleanDesc,
          "sku": product.handle,
          "brand": {
            "@type": "Brand",
            "name": "ADRINI"
          },
          "offers": {
            "@type": "Offer",
            "url": canonical,
            "priceCurrency": "INR",
            "price": price,
            "availability": `https://schema.org/${availability}`,
            "itemCondition": "https://schema.org/NewCondition"
          }
        },
        {
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": SITE_URL },
            { "@type": "ListItem", "position": 2, "name": "Products", "item": `${SITE_URL}/all-collections.html` },
            { "@type": "ListItem", "position": 3, "name": product.title, "item": canonical }
          ]
        }
      ]
    };

    let html = productTemplate;
    // Remove old title/meta
    html = html.replace(/<title>.*?<\/title>/s, '');
    html = html.replace(/<meta name="description".*?>/s, '');
    html = html.replace(/<meta property="og:.*?>/gs, '');
    html = html.replace(/<link rel="canonical".*?>/s, '');
    
    // Inject new SEO block
    const seoBlock = `
    <title>${cleanTitle}</title>
    <meta name="description" content="${cleanDesc}">
    <link rel="canonical" href="${canonical}">
    <meta property="og:title" content="${cleanTitle}">
    <meta property="og:description" content="${cleanDesc}">
    <meta property="og:type" content="product">
    <meta property="og:url" content="${canonical}">
    <meta property="og:image" content="${imgUrl}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${cleanTitle}">
    <meta name="twitter:description" content="${cleanDesc}">
    <meta name="twitter:image" content="${imgUrl}">
    <script type="application/ld+json">\n${JSON.stringify(jsonLd, null, 2)}\n    </script>
    `;

    html = html.replace('</head>', `${seoBlock}\n</head>`);

    // Ensure assets load correctly from subdirectory (../)
    // The current html links like href="src/styles/..." and src="src/scripts/..."
    // Need to change to "/src/styles/..." to work from any depth
    html = html.replace(/href="src\//g, 'href="/src/');
    html = html.replace(/src="src\//g, 'src="/src/');
    html = html.replace(/href="images\//g, 'href="/images/');
    html = html.replace(/src="images\//g, 'src="/images/');

    // Ensure link to all-collections and other pages are absolute or root-relative
    html = html.replace(/href="all-collections\.html"/g, 'href="/all-collections.html"');
    html = html.replace(/href="index\.html"/g, 'href="/"');

    fs.writeFileSync(path.join(dir, 'index.html'), html);
    sitemapUrls.push(`<url><loc>${canonical}</loc><changefreq>weekly</changefreq></url>`);
  }

  console.log('Generating collection pages...');
  for (const collection of collections) {
    const dir = path.join('collections', collection.handle);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const title = `${collection.title} | ADRINI`;
    const description = `Explore the ${collection.title} collection at ADRINI. Discover premium sarees crafted for every occasion.`;
    const canonical = `${SITE_URL}/collections/${collection.handle}`;
    const imgUrl = collection.image?.url || `${SITE_URL}/images/desktop_hero.webp`;

    const cleanTitle = title.replace(/"/g, '&quot;');
    const cleanDesc = truncateString(description.replace(/"/g, '&quot;'), 160);

    const jsonLd = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "CollectionPage",
          "name": collection.title,
          "description": cleanDesc,
          "url": canonical,
          "image": imgUrl
        },
        {
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": SITE_URL },
            { "@type": "ListItem", "position": 2, "name": "Collections", "item": `${SITE_URL}/all-collections.html` },
            { "@type": "ListItem", "position": 3, "name": collection.title, "item": canonical }
          ]
        }
      ]
    };

    let html = collectionTemplate;
    // Remove old title/meta
    html = html.replace(/<title>.*?<\/title>/s, '');
    html = html.replace(/<meta name="description".*?>/s, '');
    html = html.replace(/<meta property="og:.*?>/gs, '');
    html = html.replace(/<link rel="canonical".*?>/s, '');
    
    // Inject new SEO block
    const seoBlock = `
    <title>${cleanTitle}</title>
    <meta name="description" content="${cleanDesc}">
    <link rel="canonical" href="${canonical}">
    <meta property="og:title" content="${cleanTitle}">
    <meta property="og:description" content="${cleanDesc}">
    <meta property="og:type" content="website">
    <meta property="og:url" content="${canonical}">
    <meta property="og:image" content="${imgUrl}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${cleanTitle}">
    <meta name="twitter:description" content="${cleanDesc}">
    <meta name="twitter:image" content="${imgUrl}">
    <script type="application/ld+json">\n${JSON.stringify(jsonLd, null, 2)}\n    </script>
    `;

    html = html.replace('</head>', `${seoBlock}\n</head>`);

    // Fix relative assets
    html = html.replace(/href="src\//g, 'href="/src/');
    html = html.replace(/src="src\//g, 'src="/src/');
    html = html.replace(/href="images\//g, 'href="/images/');
    html = html.replace(/src="images\//g, 'src="/images/');
    html = html.replace(/href="all-collections\.html"/g, 'href="/all-collections.html"');
    html = html.replace(/href="index\.html"/g, 'href="/"');

    fs.writeFileSync(path.join(dir, 'index.html'), html);
    sitemapUrls.push(`<url><loc>${canonical}</loc><changefreq>weekly</changefreq></url>`);
  }

  console.log('Generating sitemap.xml...');
  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${sitemapUrls.join('\n  ')}
</urlset>`;
  fs.writeFileSync('sitemap.xml', sitemapXml);

  console.log('Build complete!');
}

build().catch(err => {
  console.error('Build failed:', err);
  process.exit(1);
});
