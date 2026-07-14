// netlify/functions/oauth.js

const https = require('https');

function httpsPost(hostname, path, body) {
    return new Promise((resolve, reject) => {
        const postData = new URLSearchParams(body).toString();
        const req = https.request({
            hostname,
            path,
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(postData)
            }
        }, (res) => {
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch(e) {
                    reject(new Error(`Failed to parse JSON: ${data}`));
                }
            });
        });
        req.on('error', reject);
        req.write(postData);
        req.end();
    });
}

exports.handler = async (event) => {
    const params = event.queryStringParameters || {};
    const code = params.code;
    const shop = params.shop || 'adrini-5666.myshopify.com';

    const CORS = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers: CORS, body: 'OK' };
    }

    if (!code) {
        return {
            statusCode: 400,
            headers: { 'Content-Type': 'text/html', ...CORS },
            body: `
                <html>
                    <body style="font-family: sans-serif; padding: 40px; text-align: center;">
                        <h2 style="color: #bf0711;">Error: Missing authorization code</h2>
                        <p>Please launch this installation from your Shopify Admin dashboard.</p>
                    </body>
                </html>
            `
        };
    }

    try {
        const tokenResponse = await httpsPost(
            shop,
            '/admin/oauth/access_token',
            {
                client_id: '9d31bcc4e9fe24391c2c2565a077b43b',
                client_secret: process.env.SHOPIFY_API_SECRET,
                code: code
            }
        );

        if (tokenResponse.access_token) {
            return {
                statusCode: 200,
                headers: { 'Content-Type': 'text/html', ...CORS },
                body: `
                    <html>
                        <body style="font-family: sans-serif; padding: 40px; text-align: center; background: #f4f6f8;">
                            <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); max-width: 600px; margin: 40px auto;">
                                <h1 style="color: #2c6ecb; margin-bottom: 20px;">Shopify Connection Successful!</h1>
                                <p style="font-size: 16px; color: #637381;">Here is your Admin Access Token. Double-click it to highlight, then copy it:</p>
                                <div style="background: #f1f2f3; padding: 15px; border-radius: 4px; font-family: monospace; font-size: 18px; font-weight: bold; word-break: break-all; margin: 20px 0; border: 1px solid #d2d5d8; user-select: all;">
                                    ${tokenResponse.access_token}
                                </div>
                                <p style="color: #bf0711; font-weight: bold; font-size: 15px;">Step 2: Paste this token into your Netlify dashboard as the value for "SHOPIFY_ADMIN_TOKEN".</p>
                                <p style="font-size: 14px; color: #919eab;">You can now close this tab.</p>
                            </div>
                        </body>
                    </html>
                `
            };
        } else {
            return {
                statusCode: 400,
                headers: { 'Content-Type': 'text/html', ...CORS },
                body: `
                    <html>
                        <body style="font-family: sans-serif; padding: 40px; text-align: center;">
                            <h2 style="color: #bf0711;">Failed to retrieve access token</h2>
                            <p style="color: #637381;">Here is the debug response from Shopify:</p>
                            <pre style="text-align: left; background: #eee; padding: 20px; border-radius: 4px; max-width: 600px; margin: 20px auto; overflow-x: auto;">${JSON.stringify(tokenResponse, null, 2)}</pre>
                        </body>
                    </html>
                `
            };
        }
    } catch (err) {
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'text/html', ...CORS },
            body: `
                <html>
                    <body style="font-family: sans-serif; padding: 40px; text-align: center;">
                        <h2 style="color: #bf0711;">Internal Server Error</h2>
                        <p style="color: #637381;">${err.message}</p>
                    </body>
                </html>
            `
        };
    }
};
