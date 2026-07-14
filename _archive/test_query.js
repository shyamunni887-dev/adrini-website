async function test() {
    const collections = [
        { handle: 'kalyani-cotton', id: 'price-kalyani-cotton' },
        { handle: 'mul-cotton', id: 'price-mul-cotton' },
        { handle: 'kadhi-cotton', id: 'price-kadhi-cotton' },
        { handle: 'banarasi', id: 'price-banarasi' }
    ];
    let queryAliases = collections.map((col, idx) => {
        return `
            c${idx}: collection(handle: "${col.handle}") {
                products(first: 20, sortKey: PRICE, reverse: false) {
                    edges {
                        node {
                            availableForSale
                            priceRange {
                                minVariantPrice {
                                    amount
                                }
                            }
                        }
                    }
                }
            }
        `;
    }).join('\n');
    
    const query = `{ ${queryAliases} }`;
    const res = await fetch(`https://adrini-5666.myshopify.com/api/2024-01/graphql.json`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Storefront-Access-Token': '5a869208a525680f7f1f91e2d8b20a97'
        },
        body: JSON.stringify({ query })
    });
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
}
test();
