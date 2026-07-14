// netlify/functions/get-token.js
// A one-time helper to guide you through getting a Shopify Admin Token.
// Visit: https://adrini.com/.netlify/functions/get-token

exports.handler = async () => {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Adrini — Get Shopify Admin Token</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, #0a0a0a 0%, #1a0a2e 50%, #0a0a0a 100%);
            min-height: 100vh;
            display: flex;
            align-items: flex-start;
            justify-content: center;
            padding: 40px 20px;
            color: #fff;
        }
        .container {
            max-width: 700px;
            width: 100%;
        }
        .header {
            text-align: center;
            margin-bottom: 40px;
        }
        .header h1 {
            font-size: 28px;
            font-weight: 700;
            background: linear-gradient(90deg, #c084fc, #f472b6);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 8px;
        }
        .header p {
            color: #9ca3af;
            font-size: 15px;
        }
        .step {
            background: rgba(255,255,255,0.04);
            border: 1px solid rgba(255,255,255,0.08);
            border-radius: 12px;
            padding: 24px;
            margin-bottom: 16px;
            position: relative;
        }
        .step-num {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 32px;
            height: 32px;
            background: linear-gradient(135deg, #c084fc, #f472b6);
            border-radius: 50%;
            font-weight: 700;
            font-size: 14px;
            color: #fff;
            margin-bottom: 12px;
        }
        .step h2 {
            font-size: 16px;
            font-weight: 600;
            color: #f3f4f6;
            margin-bottom: 8px;
        }
        .step p, .step li {
            font-size: 14px;
            color: #9ca3af;
            line-height: 1.7;
        }
        .step ul { padding-left: 20px; }
        .step li { margin-bottom: 4px; }
        .link-btn {
            display: inline-block;
            margin-top: 12px;
            padding: 10px 20px;
            background: linear-gradient(135deg, #c084fc, #f472b6);
            color: #fff;
            text-decoration: none;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            transition: opacity 0.2s;
        }
        .link-btn:hover { opacity: 0.85; }
        .highlight {
            background: rgba(192, 132, 252, 0.15);
            border: 1px solid rgba(192, 132, 252, 0.3);
            border-radius: 6px;
            padding: 2px 8px;
            font-family: monospace;
            font-size: 13px;
            color: #c084fc;
        }
        .token-box {
            background: rgba(0,0,0,0.4);
            border: 1px solid rgba(192,132,252,0.3);
            border-radius: 8px;
            padding: 16px;
            margin-top: 12px;
            font-family: monospace;
            font-size: 13px;
            color: #a3e635;
            word-break: break-all;
            line-height: 1.6;
        }
        .warning {
            background: rgba(251,191,36,0.1);
            border: 1px solid rgba(251,191,36,0.3);
            border-radius: 8px;
            padding: 12px 16px;
            margin-top: 12px;
            font-size: 13px;
            color: #fbbf24;
        }
        .success-box {
            background: rgba(34,197,94,0.1);
            border: 1px solid rgba(34,197,94,0.3);
            border-radius: 8px;
            padding: 16px;
            margin-top: 12px;
            font-size: 14px;
            color: #4ade80;
        }
        .copy-area {
            margin-top: 16px;
        }
        .copy-area input {
            width: 100%;
            padding: 12px;
            background: rgba(0,0,0,0.5);
            border: 1px solid rgba(192,132,252,0.4);
            border-radius: 8px;
            color: #c084fc;
            font-family: monospace;
            font-size: 13px;
            outline: none;
        }
        .copy-area input:focus {
            border-color: #c084fc;
        }
        .env-name {
            display: inline-block;
            background: #1e1b4b;
            border: 1px solid #4c1d95;
            border-radius: 4px;
            padding: 2px 8px;
            font-family: monospace;
            font-size: 13px;
            color: #a78bfa;
        }
        .netlify-link {
            color: #60a5fa;
            text-decoration: none;
        }
        .netlify-link:hover { text-decoration: underline; }
    </style>
</head>
<body>
<div class="container">
    <div class="header">
        <h1>🛍️ Get Your Shopify Admin Token</h1>
        <p>Follow these 4 simple steps to connect Adrini to your Shopify store</p>
    </div>

    <div class="step">
        <div class="step-num">1</div>
        <h2>Open Shopify Admin → Apps → App Development</h2>
        <p>Click the button below to go directly to your Shopify Admin App Development page:</p>
        <a href="https://adrini-5666.myshopify.com/admin/apps/development" target="_blank" class="link-btn">
            → Open Shopify App Development
        </a>
    </div>

    <div class="step">
        <div class="step-num">2</div>
        <h2>Create a New Custom App</h2>
        <ul>
            <li>Click <strong>"Create an app"</strong> (top right button)</li>
            <li>App name: <span class="highlight">adrini-sync</span></li>
            <li>Click <strong>"Create app"</strong></li>
        </ul>
    </div>

    <div class="step">
        <div class="step-num">3</div>
        <h2>Configure Admin API Scopes</h2>
        <ul>
            <li>Inside the newly created app, click <strong>"Configure Admin API scopes"</strong></li>
            <li>Search for and enable: <span class="highlight">write_customers</span> and <span class="highlight">read_customers</span></li>
            <li>Click <strong>"Save"</strong></li>
            <li>Then go to <strong>"API credentials"</strong> tab</li>
            <li>Click <strong>"Install app"</strong></li>
            <li>Click <strong>"Install"</strong> to confirm</li>
        </ul>
        <div class="warning">
            ⚠️ You must click "Install app" to generate the token. It won't appear until after installation.
        </div>
    </div>

    <div class="step">
        <div class="step-num">4</div>
        <h2>Copy Your Admin API Access Token</h2>
        <p>After installing, you'll see <strong>"Admin API access token"</strong> — click <strong>"Reveal token once"</strong>.</p>
        <div class="token-box">
            It will look like: shpat_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
        </div>
        <div class="warning">
            ⚠️ Shopify only shows this token ONCE. Copy it immediately before leaving the page!
        </div>
        <div class="success-box">
            ✅ Once you have the token, paste it as a Netlify Environment Variable named<br>
            <strong>SHOPIFY_ADMIN_TOKEN</strong><br><br>
            Then visit:<br>
            <a href="https://app.netlify.com/sites/adrini/configuration/env" target="_blank" class="netlify-link">
                → Netlify Dashboard → Environment Variables
            </a>
        </div>
    </div>

    <div class="step">
        <div class="step-num">✓</div>
        <h2>That's it! What happens next:</h2>
        <ul>
            <li>After setting <span class="env-name">SHOPIFY_ADMIN_TOKEN</span> in Netlify, your cart & wishlist will sync across all browsers when users are logged in.</li>
            <li>Redeploy Netlify (or wait ~1 minute) for the new variable to take effect.</li>
            <li>Test by adding items to cart/wishlist in one browser, then logging in with the same Google account in another.</li>
        </ul>
    </div>
</div>
</body>
</html>`;

    return {
        statusCode: 200,
        headers: { 'Content-Type': 'text/html' },
        body: html
    };
};
