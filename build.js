import fs from 'fs';
import path from 'path';
import * as cheerio from 'cheerio';

const STORE_DOMAIN = 'adrini-5666.myshopify.com';
const API_URL = `https://${STORE_DOMAIN}/api/2024-01/graphql.json`;
const ACCESS_TOKEN = '5a869208a525680f7f1f91e2d8b20a97';
const SITE_URL = 'https://adrini.com';

const FETCH_PRODUCTS_QUERY = `
  query {
    products(first: 250) {
      edges {
        node {
          id
          title
          handle
          descriptionHtml
          productType
          tags
          seo { title description }
          images(first: 10) { edges { node { url altText } } }
          variants(first: 250) {
            edges {
              node {
                id
                title
                price { amount currencyCode }
                compareAtPrice { amount currencyCode }
                availableForSale
                quantityAvailable
                selectedOptions { name value }
              }
            }
          }
          collections(first: 5) {
            edges {
              node {
                title
                handle
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
          id
          title
          handle
          descriptionHtml
          seo { title description }
          image { url }
          products(first: 250) {
            edges {
              node {
                id
                title
                handle
                productType
                tags
                images(first: 2) { edges { node { url altText } } }
                variants(first: 1) {
                  edges {
                    node {
                      id
                      price { amount currencyCode }
                      compareAtPrice { amount currencyCode }
                      availableForSale
                      quantityAvailable
                    }
                  }
                }
              }
            }
          }
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
  if (str.length <= num) return str;
  return str.slice(0, num) + '...';
}

function cleanStr(str) {
  if (!str) return '';
  return str.replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function getSrcset(url) {
  if (!url) return '';
  // Shopify CDN transform parameter allows getting different sizes
  // Instead of complex params, we can just append transform
  const sizes = [400, 600, 800, 1200];
  return sizes.map(s => `${url}&width=${s} ${s}w`).join(', ');
}

async function build() {
  console.log('Fetching products and collections...');
  const [productsData, collectionsData] = await Promise.all([
    fetchGraphQL(FETCH_PRODUCTS_QUERY),
    fetchGraphQL(FETCH_COLLECTIONS_QUERY)
  ]);

  const products = productsData.data.products.edges.map(e => e.node);
  const collections = collectionsData.data.collections.edges.map(e => e.node);
  
  // also inject an 'all' collection for shopify backward compatibility if not present
  if (!collections.find(c => c.handle === 'all')) {
     collections.push({
         id: 'gid://shopify/Collection/all',
         title: 'All Products',
         handle: 'all',
         descriptionHtml: '',
         products: { edges: products.map(p => ({ node: p })) }
     });
  }

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
    const description = product.seo?.description || `Shop ${product.title} at ADRINI. Premium quality sarees with secure payments, fast delivery across India.`;
    const canonical = `${SITE_URL}/products/${product.handle}`;
    let imgUrl = product.images.edges[0]?.node?.url || `${SITE_URL}/images/desktop_hero.webp`;
    if (imgUrl.includes('?')) imgUrl += '&width=1200'; else imgUrl += '?width=1200';
    
    const variant = product.variants.edges[0]?.node;
    const price = variant?.price?.amount || '0';
    const compareAt = variant?.compareAtPrice?.amount;
    const availability = variant?.availableForSale ? 'InStock' : 'OutOfStock';
    
    // Use Cheerio to parse and modify DOM
    const $ = cheerio.load(productTemplate);
    
    // SEO tags
    $('title').text(title);
    $('meta[name="description"]').attr('content', description);
    $('meta[property="og:title"]').attr('content', title);
    $('meta[property="og:description"]').attr('content', description);
    $('meta[property="og:url"]').attr('content', canonical);
    $('meta[property="og:image"]').attr('content', imgUrl);
    $('meta[name="twitter:title"]').attr('content', title);
    $('meta[name="twitter:description"]').attr('content', description);
    $('meta[name="twitter:image"]').attr('content', imgUrl);
    $('link[rel="canonical"]').attr('href', canonical);
    
    // Preconnect & Preload
    $('head').prepend('<link rel="preconnect" href="https://cdn.shopify.com" crossorigin>');
    $('head').prepend('<link rel="dns-prefetch" href="https://cdn.shopify.com">');
    if (imgUrl) {
       $('head').append(`<link rel="preload" href="${imgUrl}" as="image" fetchpriority="high">`);
    }
    
    // Fix Relative URLs
    $('[href^="src/"]').each((i, el) => $(el).attr('href', '/' + $(el).attr('href')));
    $('[src^="src/"]').each((i, el) => $(el).attr('src', '/' + $(el).attr('src')));
    $('[href^="images/"]').each((i, el) => $(el).attr('href', '/' + $(el).attr('href')));
    $('[src^="images/"]').each((i, el) => $(el).attr('src', '/' + $(el).attr('src')));
    $('[href="all-collections.html"]').attr('href', '/all-collections.html');
    $('[href="index.html"]').attr('href', '/');
    
    // SSR State Injection
    const initialState = { product: product };
    $('head').append(`<script>window.__INITIAL_STATE__ = ${JSON.stringify(initialState)};</script>`);
    
    // --- TRUE SSR: Inject Product Data ---
    $('.lm-pp-pi-name').text(product.title);
    $('.lm-pp-pi-price').text('₹' + parseFloat(price).toLocaleString('en-IN'));
    if (compareAt && parseFloat(compareAt) > parseFloat(price)) {
      $('.lm-pp-pi-price-old').text('₹' + parseFloat(compareAt).toLocaleString('en-IN')).css('display', 'inline-block');
      const pct = Math.round(((parseFloat(compareAt) - parseFloat(price)) / parseFloat(compareAt)) * 100);
      $('.lm-pp-pi-discount').text(`${pct}% off`).css('display', 'inline-block');
    } else {
      $('.lm-pp-pi-price-old').css('display', 'none');
      $('.lm-pp-pi-discount').css('display', 'none');
    }
    
    // Inject Images
    let mainImagesHtml = '';
    let thumbRowHtml = '';
    product.images.edges.forEach((edge, idx) => {
        let iUrl = edge.node.url;
        if (iUrl.includes('?')) iUrl += '&width=1200'; else iUrl += '?width=1200';
        let tUrl = edge.node.url;
        if (tUrl.includes('?')) tUrl += '&width=200'; else tUrl += '?width=200';
        
        const activeClass = idx === 0 ? 'active' : '';
        const loading = idx === 0 ? 'eager' : 'lazy';
        const fetchPri = idx === 0 ? 'high' : 'auto';
        const decoding = idx === 0 ? 'sync' : 'async';
        const altText = cleanStr(edge.node.altText || product.title);
        
        mainImagesHtml += `
          <div class="lm-pp-main-img ${activeClass}" id="img-${idx}" ${idx !== 0 ? 'style="display:none;"' : ''}>
            <span class="lm-pp-img-badge" style="display:none;"></span>
            <img src="${iUrl}" alt="${altText} - View ${idx + 1}" loading="${loading}" decoding="${decoding}" fetchpriority="${fetchPri}" width="800" height="1200" style="object-fit:cover; width:100%; height:100%;">
          </div>
        `;
        thumbRowHtml += `
          <div class="lm-pp-thumb ${activeClass}" onclick="window.selectImage(${idx})">
            <img src="${tUrl}" alt="${altText} Thumb ${idx + 1}" loading="lazy" decoding="async" width="100" height="150" style="object-fit:cover; width:100%; height:100%;">
          </div>
        `;
    });
    $('.lm-pp-main-images').html(mainImagesHtml);
    $('.lm-pp-thumb-row').html(thumbRowHtml);
    
    // Breadcrumbs
    const collName = product.collections?.edges[0]?.node?.title || 'Shop';
    const collHandle = product.collections?.edges[0]?.node?.handle || 'all';
    $('.lm-pp-bc-cat').html(`<a href="/collections/${collHandle}" style="text-decoration:none; color:inherit;">${collName}</a>`);
    $('.lm-pp-bc-cur').text(product.title);
    $('.lm-pp-pi-breadcrumb').text(collName);
    
    // Description
    if (product.descriptionHtml) {
        $('#dynamic-desc-body').html(product.descriptionHtml);
    } else {
        $('.lm-pp-acc-item:first-child').css('display', 'none');
    }
    
    // Inventory
    let maxQty = 99;
    if (variant && variant.quantityAvailable !== null) maxQty = variant.quantityAvailable;
    else if (variant && !variant.availableForSale) maxQty = 0;
    
    const stockLabel = $('.lm-pp-qty-label');
    const atcBtn = $('#pp-atc-btn');
    if (stockLabel.length) {
        if (maxQty === 0) {
            stockLabel.text('Sold Out').css('color', '#1a1208');
            if (atcBtn.length) atcBtn.text('Notify Me When Available').css({background: '#faf9f6', color: '#1a1208', border: '1px solid rgba(26,18,8,0.2)'});
        } else if (maxQty < 10 && variant.quantityAvailable !== null) {
            stockLabel.text(`Only ${maxQty} left in stock!`).css('color', '#c9943a');
        } else {
            stockLabel.text('In stock — ships in 1–2 days').css('color', '#8a7d6b');
        }
    }

    // Save
    fs.writeFileSync(path.join(dir, 'index.html'), $.html());
    sitemapUrls.push(`<url><loc>${canonical}</loc><changefreq>weekly</changefreq></url>`);
  }

  console.log('Generating collection pages...');
  for (const collection of collections) {
    const dir = path.join('collections', collection.handle);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const title = `${collection.title} | ADRINI`;
    const description = collection.seo?.description || `Explore the ${collection.title} collection at ADRINI. Discover premium sarees crafted for every occasion.`;
    const canonical = `${SITE_URL}/collections/${collection.handle}`;
    
    const $ = cheerio.load(collectionTemplate);
    
    // SEO
    $('title').text(title);
    $('meta[name="description"]').attr('content', description);
    $('meta[property="og:title"]').attr('content', title);
    $('meta[property="og:url"]').attr('content', canonical);
    $('link[rel="canonical"]').attr('href', canonical);
    
    // Preconnect
    $('head').prepend('<link rel="preconnect" href="https://cdn.shopify.com" crossorigin>');
    $('head').prepend('<link rel="dns-prefetch" href="https://cdn.shopify.com">');
    
    // Fix Relative URLs
    $('[href^="src/"]').each((i, el) => $(el).attr('href', '/' + $(el).attr('href')));
    $('[src^="src/"]').each((i, el) => $(el).attr('src', '/' + $(el).attr('src')));
    $('[href^="images/"]').each((i, el) => $(el).attr('href', '/' + $(el).attr('href')));
    $('[src^="images/"]').each((i, el) => $(el).attr('src', '/' + $(el).attr('src')));
    $('[href="all-collections.html"]').attr('href', '/all-collections.html');
    $('[href="index.html"]').attr('href', '/');
    
    // SSR State Injection
    const initialState = { collection: collection };
    $('head').append(`<script>window.__INITIAL_STATE__ = ${JSON.stringify(initialState)};</script>`);
    
    // --- TRUE SSR: Inject Collection Data ---
    $('#coll-bc').text(collection.title);
    $('#coll-title').text(collection.title);
    if (collection.descriptionHtml) {
        $('#coll-desc').html(collection.descriptionHtml).css('display', 'block');
    } else {
        $('#coll-desc').css('display', 'none');
    }
    $('#coll-loading').css('display', 'none'); // Remove loading spinner
    $('#coll-toolbar').css('display', 'flex');
    
    const collProducts = collection.products?.edges?.map(e => e.node) || [];
    $('#coll-count').text(`${collProducts.length} Product${collProducts.length !== 1 ? 's' : ''}`);
    
    let gridHtml = '';
    collProducts.forEach((p, idx) => {
        const v = p.variants.edges[0]?.node;
        const pPrice = v?.price?.amount || 0;
        const pComp = v?.compareAtPrice?.amount || 0;
        let iUrl1 = p.images.edges[0]?.node?.url || '';
        if (iUrl1 && iUrl1.includes('?')) iUrl1 += '&width=600'; else if(iUrl1) iUrl1 += '?width=600';
        let iUrl2 = p.images.edges[1]?.node?.url || iUrl1;
        if (iUrl2 && iUrl2.includes('?')) iUrl2 += '&width=600'; else if(iUrl2) iUrl2 += '?width=600';
        
        const isSoldOut = !v?.availableForSale;
        const isSale = parseFloat(pComp) > parseFloat(pPrice);
        const altText = cleanStr(p.images.edges[0]?.node?.altText || p.title);
        
        // Eager load first 4 images in grid for fast LCP
        const loading = idx < 4 ? 'eager' : 'lazy';
        const fetchPri = idx < 4 ? 'high' : 'auto';
        const decoding = idx < 4 ? 'sync' : 'async';
        
        let badgeHtml = '';
        if (isSoldOut) badgeHtml = '<div class="lm-c-badge sold-out" style="position:absolute; top:8px; left:8px; z-index:2; background:#fff; font-size:10px; font-weight:600; padding:4px 8px; border-radius:4px;">Sold Out</div>';
        else if (isSale) badgeHtml = '<div class="lm-c-badge sale" style="position:absolute; top:8px; left:8px; z-index:2; background:#c9943a; color:#fff; font-size:10px; font-weight:600; padding:4px 8px; border-radius:4px;">Sale</div>';
        
        gridHtml += `
        <div class="product-card" onclick="window.location.href='/products/${p.handle}'" data-id="${v?.id}" data-handle="${p.handle}" data-title="${cleanStr(p.title)}" data-price="${pPrice}" data-inventory="${v?.quantityAvailable ?? 10}" data-type="${p.productType || 'Saree'}" data-tags="${(p.tags || []).join(',').replace(/"/g, '&quot;')}">
            <div class="card-img-wrap" style="position:relative; width:100%; aspect-ratio:2/3; overflow:hidden;">
                ${badgeHtml}
                <img src="${iUrl1}" alt="${altText}" class="primary-img" loading="${loading}" decoding="${decoding}" fetchpriority="${fetchPri}" width="400" height="600" style="object-fit:cover; width:100%; height:100%; position:absolute; inset:0; transition:opacity 0.3s;">
                ${iUrl2 !== iUrl1 ? `<img src="${iUrl2}" alt="${altText} hover" class="hover-img" loading="lazy" decoding="async" width="400" height="600" style="object-fit:cover; width:100%; height:100%; position:absolute; inset:0; opacity:0; transition:opacity 0.3s;">` : ''}
                <div class="card-overlay"></div>
                <button class="card-wish" data-id="${v?.id}" data-title="${cleanStr(p.title)}" data-price="${pPrice}" data-img="${iUrl1}" data-handle="${p.handle}" onclick="event.preventDefault(); event.stopPropagation(); window.toggleCardWishlist(this)">♡</button>
                <button class="quick-add" data-id="${v?.id}" data-title="${cleanStr(p.title)}" data-price="${pPrice}" data-img="${iUrl1}" data-handle="${p.handle}" data-inventory="${v?.quantityAvailable ?? 10}" onclick="event.preventDefault(); event.stopPropagation(); window.addTemplateToCart(this)">Add to cart <span>+</span></button>
            </div>
            <div class="card-info" style="padding:12px 8px;">
                <p class="card-name" style="margin:0 0 4px; font-size:14px; color:#1a1208;">${p.title}</p>
                <p class="card-fabric" style="margin:0 0 6px; font-size:12px; color:#8a7d6b;">${p.productType || 'Saree'}</p>
                <div class="card-bottom">
                    <div class="card-price-wrap" style="display:flex; align-items:center;">
                        <span class="card-price" style="font-size:14px; font-weight:500;">₹${parseFloat(pPrice).toLocaleString('en-IN')}</span>
                        ${isSale ? `<span class="card-price-old" style="text-decoration: line-through; margin-left:5px; font-size:12px; color:rgba(26,18,8,0.4);">₹${parseFloat(pComp).toLocaleString('en-IN')}</span>` : ''}
                    </div>
                </div>
            </div>
        </div>
        `;
        
        if (idx < 4 && iUrl1) {
            $('head').append(`<link rel="preload" href="${iUrl1}" as="image" fetchpriority="high">`);
        }
    });
    
    $('#coll-grid').html(gridHtml);

    fs.writeFileSync(path.join(dir, 'index.html'), $.html());
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

build().catch(console.error);
