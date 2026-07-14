// ── Netlify Serverless Function: Google Auth ──────────────────────────────
// Handles Google Sign-In → creates/logs in Shopify customer → returns token
// Environment variables required in Netlify dashboard:
//   SHOPIFY_ADMIN_TOKEN   - Shopify Admin API token (keep secret!)
//   GOOGLE_CLIENT_ID      - Google OAuth Client ID (public)
//   PASSWORD_SALT         - Any random secret string (e.g. "adrini_secret_2024")

const https = require('https');

const SHOPIFY_DOMAIN    = 'adrini-5666.myshopify.com';
const SHOPIFY_SF_TOKEN  = '5a869208a525680f7f1f91e2d8b20a97'; // Storefront token

// ── helpers ──────────────────────────────────────────────────────────────────

function httpsPost(hostname, path, headers, body) {
    return new Promise((resolve, reject) => {
        const buf = Buffer.from(body);
        const req = https.request({ hostname, path, method: 'POST', headers: { ...headers, 'Content-Length': buf.length } }, (res) => {
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => { try { resolve(JSON.parse(data)); } catch(e) { reject(e); } });
        });
        req.on('error', reject);
        req.write(buf);
        req.end();
    });
}

function httpsGet(hostname, path, headers) {
    return new Promise((resolve, reject) => {
        https.get({ hostname, path, headers }, (res) => {
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => { try { resolve(JSON.parse(data)); } catch(e) { reject(e); } });
        }).on('error', reject);
    });
}

async function verifyGoogleToken(credential) {
    // Use Google's tokeninfo endpoint to verify the ID token
    return httpsGet('oauth2.googleapis.com', `/tokeninfo?id_token=${credential}`, {});
}

async function storefrontQuery(query, variables) {
    return httpsPost(
        SHOPIFY_DOMAIN,
        '/api/2024-01/graphql.json',
        { 'Content-Type': 'application/json', 'X-Shopify-Storefront-Access-Token': SHOPIFY_SF_TOKEN },
        JSON.stringify({ query, variables })
    );
}

async function adminQuery(query, variables) {
    return httpsPost(
        SHOPIFY_DOMAIN,
        '/admin/api/2024-01/graphql.json',
        { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': process.env.SHOPIFY_ADMIN_TOKEN },
        JSON.stringify({ query, variables })
    );
}

// Derive a deterministic password from Google sub + secret salt
// This is server-side only — never exposed to the browser
function derivePassword(googleSub) {
    const salt = process.env.PASSWORD_SALT || 'adrini_secure_2024';
    return `Ggl_${googleSub}_${salt}`.slice(0, 40);
}

// ── main handler ─────────────────────────────────────────────────────────────

exports.handler = async (event) => {
    const CORS = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
    };

    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers: CORS, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: 'Method not allowed' }) };
    }


    try {
        let credential;
        let isRedirect = false;

        if (event.headers['content-type'] && event.headers['content-type'].includes('application/x-www-form-urlencoded')) {
            const params = new URLSearchParams(event.body);
            credential = params.get('credential');
            isRedirect = true;
        } else {
            const bodyObj = JSON.parse(event.body || '{}');
            credential = bodyObj.credential;
        }

        const respond = (statusCode, data) => {
            if (isRedirect) {
                if (data.success) {
                    return {
                        statusCode: 200,
                        headers: { 'Content-Type': 'text/html' },
                        body: `<html><body><script>localStorage.setItem('adrini_account', '${data.accessToken}'); window.location.href='/';</script></body></html>`
                    };
                } else {
                    const errorMsg = (data.error || 'Unknown error').replace(/'/g, "\\'");
                    return {
                        statusCode: 200,
                        headers: { 'Content-Type': 'text/html' },
                        body: `<html><body><script>alert('Google Sign-In failed: ${errorMsg}'); window.location.href='/';</script></body></html>`
                    };
                }
            } else {
                return { statusCode, headers: CORS, body: JSON.stringify(data) };
            }
        };

        if (!credential) {
            return respond(400, { error: 'Missing credential' });
        }

        // ── 1. Verify the Google ID token ─────────────────────────────────────
        const googleUser = await verifyGoogleToken(credential);
        if (googleUser.error || !googleUser.email) {
            return respond(401, { error: 'Invalid Google token' });
        }

        const { email, given_name, family_name, sub, name } = googleUser;
        const firstName = given_name || (name ? name.split(' ')[0] : 'Customer');
        const lastName  = family_name || (name ? name.split(' ').slice(1).join(' ') : '');
        const password  = derivePassword(sub);

        // ── 2. Try to login with existing account ─────────────────────────────
        const loginMutation = `
            mutation customerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
                customerAccessTokenCreate(input: $input) {
                    customerAccessToken { accessToken expiresAt }
                    customerUserErrors { code field message }
                }
            }
        `;

        const loginResult = await storefrontQuery(loginMutation, { input: { email, password } });
        const existingToken = loginResult.data?.customerAccessTokenCreate?.customerAccessToken?.accessToken;

        if (existingToken) {
            return respond(200, { success: true, accessToken: existingToken, customer: { email, firstName, lastName } });
        }

        // ── 3. Try to create a new Shopify customer ───────────────────────────
        const createMutation = `
            mutation customerCreate($input: CustomerCreateInput!) {
                customerCreate(input: $input) {
                    customer { id email firstName lastName }
                    customerUserErrors { code field message }
                }
            }
        `;

        const createResult = await storefrontQuery(createMutation, {
            input: { email, password, firstName, lastName, acceptsMarketing: false }
        });

        const createErrors = createResult.data?.customerCreate?.customerUserErrors || [];
        const emailTaken   = createErrors.some(e => e.code === 'TAKEN');

        if (!emailTaken && createResult.data?.customerCreate?.customer) {
            const tokenResult = await storefrontQuery(loginMutation, { input: { email, password } });
            const newToken = tokenResult.data?.customerAccessTokenCreate?.customerAccessToken?.accessToken;
            if (newToken) {
                return respond(200, { success: true, accessToken: newToken, customer: { email, firstName, lastName } });
            }
        }

        // ── 4. Email exists with a different password ─────────────────────────
        if (emailTaken) {
             return respond(400, { error: 'An account with this email already exists. Please sign in with your email and password.' });
        }

        return respond(500, { 
            error: 'Could not authenticate. Please try email/password sign in.',
            debug_login: loginResult,
            debug_create: createResult
        });

    } catch (err) {
        console.error('google-auth error:', err);
        // If it's a redirect, we can't easily use respond() without redefining it or moving it outside.
        // Let's just return a standard HTML fallback if form-urlencoded.
        if (event.headers['content-type'] && event.headers['content-type'].includes('application/x-www-form-urlencoded')) {
            return {
                statusCode: 200,
                headers: { 'Content-Type': 'text/html' },
                body: `<html><body><script>alert('Server error during Google Sign-In. Please try again.'); window.location.href='/';</script></body></html>`
            };
        }
        return {
            statusCode: 500, headers: CORS,
            body: JSON.stringify({ error: 'Server error. Please try again.' })
        };
    }
};
