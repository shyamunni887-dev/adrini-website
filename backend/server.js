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

db.run(`CREATE TABLE IF NOT EXISTS users (
    customer_id TEXT PRIMARY KEY,
    email TEXT,
    cart_json TEXT,
    wishlist_json TEXT
)`);

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

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
});
