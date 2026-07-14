// netlify/functions/sync.js

const allowedOrigins = ['https://adrini.com', 'https://www.adrini.com', 'http://localhost:8888', 'http://127.0.0.1:8888'];

const getCORSHeaders = (origin) => {
    return {
        'Access-Control-Allow-Origin': allowedOrigins.includes(origin) ? origin : 'https://adrini.com',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
    };
};

const STOREFRONT_URL = 'https://adrini-5666.myshopify.com/api/2024-01/graphql.json';
const STOREFRONT_TOKEN = process.env.SHOPIFY_STOREFRONT_TOKEN;

exports.handler = async (event) => {
    const origin = event.headers.origin || event.headers.Origin || '';
    
    // CORS validation: block unknown origins, but allow missing origins (like same-origin GET requests)
    if (origin && !allowedOrigins.includes(origin)) {
        return {
            statusCode: 403,
            body: JSON.stringify({ error: 'Origin not allowed' })
        };
    }
    
    const corsHeaders = getCORSHeaders(origin);

    if (!STOREFRONT_TOKEN) {
        return { statusCode: 500, headers: corsHeaders, body: JSON.stringify({ error: 'Server configuration error (missing Shopify token)' }) };
    }

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers: corsHeaders, body: 'OK' };
    }

    try {
        // 1. Extract Bearer Token
        const authHeader = event.headers.authorization || event.headers.Authorization || '';
        const tokenMatch = authHeader.match(/^Bearer\s+(.*)$/);
        if (!tokenMatch) {
            return { statusCode: 401, headers: corsHeaders, body: JSON.stringify({ error: 'Missing or invalid token' }) };
        }
        let customerAccessToken = tokenMatch[1].trim().replace(/^["']|["']$/g, '');

        // 2. Verify token via Storefront API to get Customer ID and Email
        const sfResponse = await fetch(STOREFRONT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Shopify-Storefront-Access-Token': STOREFRONT_TOKEN
            },
            body: JSON.stringify({
                query: `
                    query getCustomerId($customerAccessToken: String!) {
                        customer(customerAccessToken: $customerAccessToken) { id, email }
                    }
                `,
                variables: { customerAccessToken }
            })
        });

        const sfData = await sfResponse.json();
        let customerId = sfData.data?.customer?.id;
        let customerEmail = sfData.data?.customer?.email || '';

        if (!customerId) {
            return {
                statusCode: 401,
                headers: corsHeaders,
                body: JSON.stringify({ error: 'Invalid or expired token' })
            };
        }

        // Decode base64 if necessary
        if (!customerId.startsWith('gid://')) {
            try {
                const decoded = Buffer.from(customerId, 'base64').toString('utf-8');
                if (decoded.startsWith('gid://')) customerId = decoded;
            } catch (e) {}
        }

        // Temporary production monitoring to diagnose early sync behavior
        console.log({
            customerId,
            email: customerEmail,
            customerHash: customerId.slice(-12),
            method: event.httpMethod
        });

        let supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        // Sanitize URL if user accidentally copied the /rest/v1/ part or a trailing slash
        if (supabaseUrl) {
            supabaseUrl = supabaseUrl.replace(/\/rest\/v1\/?$/, '');
            supabaseUrl = supabaseUrl.replace(/\/+$/, '');
        }

        if (!supabaseUrl || !supabaseKey) {
            return { statusCode: 500, headers: getCORSHeaders(origin), body: JSON.stringify({ error: 'Server configuration error (missing Supabase keys)' }) };
        }

        const supabaseHeaders = {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json'
        };

        // 3. Handle GET (Fetch Data from Supabase)
        if (event.httpMethod === 'GET') {
            const getUrl = `${supabaseUrl}/rest/v1/customer_data?shopify_customer_id=eq.${encodeURIComponent(customerId)}&select=*`;
            const getRes = await fetch(getUrl, { method: 'GET', headers: supabaseHeaders });
            const getData = await getRes.json();

            let result = { wishlist: [], recently_viewed: [], cart_id: null };
            if (getData && getData.length > 0) {
                const row = getData[0];
                result.wishlist = row.wishlist || [];
                result.recently_viewed = row.recently_viewed || [];
                result.cart_id = row.cart_id || null;
            }
            
            console.log('Supabase row found:', {
              wishlistCount: result.wishlist?.length || 0,
              recentlyViewedCount: result.recently_viewed?.length || 0,
              cartId: result.cart_id
            });
            
            // Temporary debug injection
            result.debug_customer_info = { customerId, email: customerEmail };

            return { statusCode: 200, headers: corsHeaders, body: JSON.stringify(result) };
        }

        // 4. Handle POST (Save Data to Supabase)
        if (event.httpMethod === 'POST') {
            const body = JSON.parse(event.body || '{}');
            const wishlist = Array.isArray(body.wishlist) ? body.wishlist : undefined;
            const recently_viewed = Array.isArray(body.recently_viewed) ? body.recently_viewed : undefined;
            const cart_id = body.cart_id !== undefined ? body.cart_id : undefined;

            // Fetch existing data first to merge if necessary, or just upsert fields provided
            const getUrl = `${supabaseUrl}/rest/v1/customer_data?shopify_customer_id=eq.${encodeURIComponent(customerId)}&select=*`;
            const getRes = await fetch(getUrl, { method: 'GET', headers: supabaseHeaders });
            const existingData = await getRes.json();

            let payload = {
                shopify_customer_id: customerId,
                email: customerEmail
            };

            if (existingData && existingData.length > 0) {
                const row = existingData[0];
                payload.wishlist = wishlist !== undefined ? wishlist : row.wishlist;
                payload.recently_viewed = recently_viewed !== undefined ? recently_viewed : row.recently_viewed;
                payload.cart_id = cart_id !== undefined ? cart_id : row.cart_id;
            } else {
                payload.wishlist = wishlist || [];
                payload.recently_viewed = recently_viewed || [];
                payload.cart_id = cart_id || null;
            }

            const upsertUrl = `${supabaseUrl}/rest/v1/customer_data?on_conflict=shopify_customer_id`;
            const upsertRes = await fetch(upsertUrl, {
                method: 'POST',
                headers: {
                    ...supabaseHeaders,
                    'Prefer': 'return=representation, resolution=merge-duplicates'
                },
                body: JSON.stringify(payload)
            });

            if (!upsertRes.ok) {
                const errText = await upsertRes.text();
                console.error('Supabase Upsert Error:', errText);
                return { statusCode: 500, headers: corsHeaders, body: JSON.stringify({ error: 'Failed to save data' }) };
            }

            return { statusCode: 200, headers: corsHeaders, body: JSON.stringify({ success: true }) };
        }

        return { statusCode: 405, headers: corsHeaders, body: 'Method Not Allowed' };

    } catch (err) {
        console.error('Sync Error:', err);
        return { statusCode: 500, headers: corsHeaders, body: JSON.stringify({ error: 'Server error' }) };
    }
};
