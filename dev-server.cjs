const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml'
};

const server = http.createServer((req, res) => {
    if (req.url.startsWith('/shopify-api/')) {
        const targetPath = req.url.replace('/shopify-api/', '/');
        const options = {
            hostname: 'adrini-5666.myshopify.com',
            port: 443,
            path: targetPath,
            method: req.method,
            headers: {
                ...req.headers,
                host: 'adrini-5666.myshopify.com',
                origin: 'https://adrini-5666.myshopify.com'
            }
        };

        const proxyReq = https.request(options, (proxyRes) => {
            res.writeHead(proxyRes.statusCode, proxyRes.headers);
            proxyRes.pipe(res, { end: true });
        });

        req.pipe(proxyReq, { end: true });
        return;
    }

    let urlPath = req.url.split('?')[0];
    
    // Netlify Rewrite Rule
    if (urlPath.startsWith('/products/')) {
        urlPath = '/product.html';
    } else if (urlPath.startsWith('/collections/')) {
        urlPath = '/collection.html';
    } else if (urlPath === '/') {
        urlPath = '/index.html';
    }

    let filePath = path.join(__dirname, urlPath);
    
    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404);
            res.end('404 Not Found');
            return;
        }
        
        const ext = path.extname(filePath);
        const contentType = MIME_TYPES[ext] || 'text/plain';
        
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
    });
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Local Development Server running at http://localhost:${PORT}/`);
});
