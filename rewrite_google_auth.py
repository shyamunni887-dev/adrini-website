import re

file_path = '/Users/shyam/Documents/adrini.com/netlify/functions/google-auth.js'

with open(file_path, 'r') as f:
    content = f.read()

# We want to replace the body of exports.handler.
# Let's just do a clean replacement of the try-catch block.
new_handler = """
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
                    const errorMsg = (data.error || 'Unknown error').replace(/'/g, "\\\\'");
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
"""

# Extract everything before try {
before_try = content[:content.find('    try {')]

with open(file_path, 'w') as f:
    f.write(before_try + new_handler + "};\n")

