const https = require('https');

const QUERY = `
query CollectionByHandle($handle: String!) {
    collection(handle: $handle) {
        title
        descriptionHtml
        products(first: 50) {
            edges {
                node {
                    id
                    handle
                    title
                    description
                    availableForSale
                    images(first: 2) { edges { node { url altText } } }
                    priceRange { minVariantPrice { amount currencyCode } }
                    variants(first: 1) {
                        edges {
                            node {
                                id
                                quantityAvailable
                                compareAtPrice { amount currencyCode }
                            }
                        }
                    }
                }
            }
        }
    }
}
`;

const data = JSON.stringify({ query: QUERY, variables: { handle: "kalyani-cotton" } });

const options = {
  hostname: 'adrini-5666.myshopify.com',
  port: 443,
  path: '/api/2024-01/graphql.json',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Shopify-Storefront-Access-Token': '5a869208a525680f7f1f91e2d8b20a97',
    'Content-Length': data.length
  }
};

const req = https.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => console.log(JSON.stringify(JSON.parse(body), null, 2)));
});

req.on('error', (e) => console.error(e));
req.write(data);
req.end();
