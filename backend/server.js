const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const SHOPIFY_DOMAIN = 'adrini-5666.myshopify.com';
const API_URL = `https://${SHOPIFY_DOMAIN}/api/2024-01/graphql.json`;
const STOREFRONT_ACCESS_TOKEN = '5a869208a525680f7f1f91e2d8b20a97'; // For server-to-Shopify communication

// Initialize Database
const db = new sqlite3.Database(path.join(__dirname, 'database.sqlite'), (err) => {
    if (err) console.error('Database connection error:', err);
    else console.log('Connected to SQLite database.');
});

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
        customer_id TEXT PRIMARY KEY,
        email TEXT,
        cart_json TEXT,
        wishlist_json TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS product_reviews (
        id TEXT PRIMARY KEY,
        product_id TEXT NOT NULL,
        rating INTEGER NOT NULL,
        title TEXT NOT NULL,
        body TEXT NOT NULL,
        author TEXT NOT NULL,
        email TEXT,
        photo TEXT,
        variant TEXT,
        verified INTEGER DEFAULT 1,
        created_at TEXT NOT NULL
    )`);

    db.run(`CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON product_reviews(product_id)`);
});

// Middleware to verify Shopify token
async function verifyShopifyToken(req, res, next) {
    const token = req.headers['authorization']?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'Unauthorized: No token provided' });

    const query = `
        query {
            customer(customerAccessToken: "${token}") {
                id
                email
            }
        }
    `;

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Shopify-Storefront-Access-Token': STOREFRONT_ACCESS_TOKEN
            },
            body: JSON.stringify({ query })
        });

        const data = await response.json();
        if (data.data && data.data.customer) {
            req.customer = data.data.customer;
            next();
        } else {
            res.status(401).json({ error: 'Unauthorized: Invalid token' });
        }
    } catch (e) {
        console.error('Error verifying token:', e);
        res.status(500).json({ error: 'Internal server error verifying token' });
    }
}

// GET /api/sync
app.get('/api/sync', verifyShopifyToken, (req, res) => {
    const customerId = req.customer.id;
    
    db.get(`SELECT cart_json, wishlist_json FROM users WHERE customer_id = ?`, [customerId], (err, row) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        
        let cart = [];
        let wishlist = [];
        if (row) {
            try { if (row.cart_json) cart = JSON.parse(row.cart_json); } catch(e){}
            try { if (row.wishlist_json) wishlist = JSON.parse(row.wishlist_json); } catch(e){}
        }
        res.json({ cart, wishlist });
    });
});

// POST /api/sync
app.post('/api/sync', verifyShopifyToken, (req, res) => {
    const customerId = req.customer.id;
    const email = req.customer.email;
    const { cart, wishlist } = req.body;
    
    const cartStr = JSON.stringify(cart || []);
    const wishlistStr = JSON.stringify(wishlist || []);

    db.run(`
        INSERT INTO users (customer_id, email, cart_json, wishlist_json)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(customer_id) DO UPDATE SET
            email = excluded.email,
            cart_json = excluded.cart_json,
            wishlist_json = excluded.wishlist_json
    `, [customerId, email, cartStr, wishlistStr], function(err) {
        if (err) {
            console.error('Save error:', err);
            return res.status(500).json({ error: 'Database error saving data' });
        }
        res.json({ success: true });
    });
});

// =============================================================
// REVIEWS API (Local Development & Testing)
// =============================================================

// GET /api/reviews?productId=<id>
app.get('/api/reviews', (req, res) => {
    const productId = req.query.productId || req.query.product_id;
    if (!productId) {
        return res.status(400).json({ error: 'Missing productId query parameter' });
    }

    // STRICT PRIVACY: email is NOT selected
    const sql = `
        SELECT id, product_id, rating, title, body, author, photo, variant, verified, created_at
        FROM product_reviews
        WHERE product_id = ?
        ORDER BY created_at DESC
    `;

    db.all(sql, [String(productId)], (err, rows) => {
        if (err) {
            console.error('Error fetching reviews:', err);
            return res.status(500).json({ error: 'Database error fetching reviews' });
        }

        const reviews = (rows || []).map(r => ({
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

        res.json(reviews);
    });
});

// POST /api/reviews
app.post('/api/reviews', (req, res) => {
    const payload = req.body || {};
    const productId = payload.productId || payload.product_id;
    const rating = Number(payload.rating);
    const title = typeof payload.title === 'string' ? payload.title.replace(/<[^>]*>?/gm, '').trim() : '';
    const body = typeof payload.body === 'string' ? payload.body.replace(/<[^>]*>?/gm, '').trim() : '';
    const author = typeof payload.author === 'string' ? payload.author.replace(/<[^>]*>?/gm, '').trim() : '';
    const email = typeof payload.email === 'string' ? payload.email.trim() : '';
    const variant = typeof payload.variant === 'string' ? payload.variant.replace(/<[^>]*>?/gm, '').trim() : '';
    const photo = typeof payload.photo === 'string' && payload.photo.startsWith('data:image/') ? payload.photo : null;

    if (!productId) {
        return res.status(400).json({ error: 'productId is required' });
    }
    if (!rating || isNaN(rating) || rating < 1 || rating > 5) {
        return res.status(400).json({ error: 'Rating must be an integer between 1 and 5' });
    }
    if (!title || title.length < 2) {
        return res.status(400).json({ error: 'Title must be at least 2 characters' });
    }
    if (!body || body.length < 5) {
        return res.status(400).json({ error: 'Review details must be at least 5 characters' });
    }
    if (!author || author.length < 2) {
        return res.status(400).json({ error: 'Author name must be at least 2 characters' });
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ error: 'Invalid email address format' });
    }

    const reviewId = `rev_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const now = new Date().toISOString();

    const insertSql = `
        INSERT INTO product_reviews (id, product_id, rating, title, body, author, email, photo, variant, verified, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.run(insertSql, [
        reviewId,
        String(productId),
        Math.round(rating),
        title,
        body,
        author,
        email || null,
        photo,
        variant || null,
        1,
        now
    ], function(err) {
        if (err) {
            console.error('Error saving review:', err);
            return res.status(500).json({ error: 'Database error saving review' });
        }

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

        res.status(201).json({
            success: true,
            review: publicReview
        });
    });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
});
