// netlify/functions/reviews.js
// Production Serverless Endpoint for ADRINI Product Reviews

const allowedOrigins = [
    'https://adrini.com',
    'https://www.adrini.com',
    'https://adrini-5666.myshopify.com',
    'http://localhost:8888',
    'http://127.0.0.1:8888',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:9292',
    'http://localhost:9292'
];

function isOriginAllowed(origin) {
    if (!origin) return true;
    if (allowedOrigins.includes(origin)) return true;
    if (origin.endsWith('.adrini.com') || origin.endsWith('.myshopify.com')) return true;
    if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return true;
    return false;
}

function getCORSHeaders(origin) {
    const allowOrigin = isOriginAllowed(origin) ? (origin || 'https://adrini.com') : 'https://adrini.com';
    return {
        'Access-Control-Allow-Origin': allowOrigin,
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Vary': 'Origin'
    };
}

function sanitizeText(str) {
    if (typeof str !== 'string') return '';
    // Strip HTML tags for clean text storage
    return str.replace(/<[^>]*>?/gm, '').trim();
}

exports.handler = async (event) => {
    const origin = event.headers.origin || event.headers.Origin || '';
    const corsHeaders = getCORSHeaders(origin);

    if (origin && !isOriginAllowed(origin)) {
        return {
            statusCode: 403,
            headers: corsHeaders,
            body: JSON.stringify({ error: 'Origin not allowed' })
        };
    }

    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: corsHeaders,
            body: 'OK'
        };
    }

    // -------------------------------------------------------------
    // GET: Retrieve Reviews for a specific Shopify Product ID
    // -------------------------------------------------------------
    if (event.httpMethod === 'GET') {
        const params = event.queryStringParameters || {};
        const productId = params.productId || params.product_id;

        if (!productId) {
            return {
                statusCode: 400,
                headers: corsHeaders,
                body: JSON.stringify({ error: 'Missing productId query parameter' })
            };
        }

        let supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (supabaseUrl) {
            supabaseUrl = supabaseUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
        }

        if (!supabaseUrl || !supabaseKey) {
            return {
                statusCode: 500,
                headers: corsHeaders,
                body: JSON.stringify({ error: 'Server configuration error (missing database credentials)' })
            };
        }

        const supabaseHeaders = {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json'
        };

        try {
            // Note: email is STRICTLY excluded from the select query to ensure customer privacy
            const selectUrl = `${supabaseUrl}/rest/v1/product_reviews?product_id=eq.${encodeURIComponent(String(productId))}&select=id,product_id,rating,title,body,author,photo,variant,verified,created_at&order=created_at.desc`;

            const res = await fetch(selectUrl, {
                method: 'GET',
                headers: supabaseHeaders
            });

            if (!res.ok) {
                const errText = await res.text();
                console.error('Supabase query error:', res.status, errText);
                return {
                    statusCode: 500,
                    headers: corsHeaders,
                    body: JSON.stringify({ error: 'Failed to retrieve reviews from database' })
                };
            }

            const rows = await res.json();
            const reviews = (Array.isArray(rows) ? rows : []).map(r => ({
                id: r.id,
                productId: String(r.product_id),
                product_id: String(r.product_id),
                rating: Number(r.rating || 5),
                title: r.title || '',
                body: r.body || '',
                author: r.author || 'Verified Customer',
                photo: r.photo || null,
                variant: r.variant || null,
                verified: Boolean(r.verified),
                date: r.created_at,
                timestamp: r.created_at ? new Date(r.created_at).getTime() : Date.now()
            }));

            return {
                statusCode: 200,
                headers: corsHeaders,
                body: JSON.stringify(reviews)
            };
        } catch (err) {
            console.error('Reviews GET Error:', err);
            return {
                statusCode: 500,
                headers: corsHeaders,
                body: JSON.stringify({ error: 'Internal server error' })
            };
        }
    }

    // -------------------------------------------------------------
    // POST: Submit a new Customer Review
    // -------------------------------------------------------------
    if (event.httpMethod === 'POST') {
        let payload;
        try {
            payload = JSON.parse(event.body || '{}');
        } catch (e) {
            return {
                statusCode: 400,
                headers: corsHeaders,
                body: JSON.stringify({ error: 'Invalid JSON body' })
            };
        }

        const productId = payload.productId || payload.product_id;
        const rating = Number(payload.rating);
        const title = sanitizeText(payload.title);
        const body = sanitizeText(payload.body);
        const author = sanitizeText(payload.author);
        const email = typeof payload.email === 'string' ? payload.email.trim() : '';
        const variant = sanitizeText(payload.variant || '');
        const photo = typeof payload.photo === 'string' && payload.photo.startsWith('data:image/') ? payload.photo : null;

        // Validation Rules
        if (!productId) {
            return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: 'productId is required' }) };
        }
        if (!rating || isNaN(rating) || rating < 1 || rating > 5) {
            return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: 'Rating must be an integer between 1 and 5' }) };
        }
        if (!title || title.length < 2) {
            return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: 'Title must be at least 2 characters' }) };
        }
        if (!body || body.length < 5) {
            return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: 'Review details must be at least 5 characters' }) };
        }
        if (!author || author.length < 2) {
            return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: 'Author name must be at least 2 characters' }) };
        }
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: 'Invalid email address format' }) };
        }

        let supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (supabaseUrl) {
            supabaseUrl = supabaseUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
        }

        if (!supabaseUrl || !supabaseKey) {
            return {
                statusCode: 500,
                headers: corsHeaders,
                body: JSON.stringify({ error: 'Server configuration error (missing database credentials)' })
            };
        }

        const supabaseHeaders = {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json'
        };

        const reviewId = `rev_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
        const now = new Date().toISOString();

        const insertRecord = {
            id: reviewId,
            product_id: String(productId),
            rating: Math.round(rating),
            title: title,
            body: body,
            author: author,
            email: email || null, // Stored privately for verification
            photo: photo,
            variant: variant || null,
            verified: true,
            created_at: now
        };

        try {
            const insertUrl = `${supabaseUrl}/rest/v1/product_reviews`;
            const insertRes = await fetch(insertUrl, {
                method: 'POST',
                headers: {
                    ...supabaseHeaders,
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify(insertRecord)
            });

            if (!insertRes.ok) {
                const errBody = await insertRes.text();
                console.error('Supabase Review Insert Error:', insertRes.status, errBody);
                return {
                    statusCode: 500,
                    headers: corsHeaders,
                    body: JSON.stringify({ error: 'Failed to save review to database' })
                };
            }

            // Public review object returned to frontend (NEVER includes email)
            const publicReview = {
                id: reviewId,
                productId: String(productId),
                product_id: String(productId),
                rating: Math.round(rating),
                title: title,
                body: body,
                author: author,
                photo: photo,
                variant: variant || null,
                verified: true,
                date: now,
                timestamp: new Date(now).getTime()
            };

            return {
                statusCode: 201,
                headers: corsHeaders,
                body: JSON.stringify({
                    success: true,
                    review: publicReview
                })
            };
        } catch (err) {
            console.error('Review Submit Error:', err);
            return {
                statusCode: 500,
                headers: corsHeaders,
                body: JSON.stringify({ error: 'Internal server error while saving review' })
            };
        }
    }

    return {
        statusCode: 405,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Method Not Allowed' })
    };
};
