const fetch = require('node-fetch'); // wait node 18+ has built in fetch
async function test() {
    const t = `
                mutation createCart($lines: [CartLineInput!]) {
                    cartCreate(input: { 
                        lines: $lines, 
                        discountCodes: ["CASH_ON_DELIVERY"],
                        attributes: [{key: "_PrepaidMethod", value: "false"}] 
                    }) {
                        cart { checkoutUrl }
                        userErrors { field message }
                    }
                }
            `;
            
    const lines = [{
        merchandiseId: "gid://shopify/ProductVariant/44445353574635",
        quantity: 1
    }];

    const res = await fetch("https://adrini-5666.myshopify.com/api/2024-01/graphql.json", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-Shopify-Storefront-Access-Token": "5a869208a525680f7f1f91e2d8b20a97",
        },
        body: JSON.stringify({ query: t, variables: { lines } }),
    });
    const json = await res.json();
    console.log(JSON.stringify(json, null, 2));
}
test();
