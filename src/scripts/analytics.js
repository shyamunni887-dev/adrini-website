// Shopify Analytics Integration
// Manages _shopify_y and _shopify_s cookies and sends Monorail events.

function generateUUID() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function getCookie(name) {
    let match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    if (match) return match[2];
    return null;
}

function setCookie(name, value, expireTimeMs) {
    let d = new Date();
    d.setTime(d.getTime() + expireTimeMs);
    document.cookie = name + "=" + value + ";expires=" + d.toUTCString() + ";path=/;Secure;SameSite=Lax";
}

const MONORAIL_SCHEMAS = {
    PAGE_VIEW: 'trekkie_storefront_page_view/1.2',
    PRODUCT_VIEW: 'trekkie_storefront_product_view/1.2',
    COLLECTION_VIEW: 'trekkie_storefront_collection_view/1.2',
    SEARCH: 'trekkie_storefront_search_submitted/1.2',
    ADD_TO_CART: 'trekkie_storefront_cart_add/1.2',
    REMOVE_FROM_CART: 'trekkie_storefront_cart_remove/1.2',
    CART_VIEW: 'trekkie_storefront_cart_view/1.2',
    CHECKOUT_STARTED: 'trekkie_storefront_checkout_started/1.2'
};

class ShopifyAnalytics {
    constructor() {
        this.yCookieName = '_shopify_y';
        this.sCookieName = '_shopify_s';
        this.ensureCookies();
    }

    ensureCookies() {
        let y = getCookie(this.yCookieName);
        if (!y) {
            y = generateUUID();
            // _shopify_y expires in 1 year
            setCookie(this.yCookieName, y, 1000 * 60 * 60 * 24 * 365);
        }
        
        let s = getCookie(this.sCookieName);
        if (!s) {
            s = generateUUID();
            // _shopify_s expires in 30 minutes
            setCookie(this.sCookieName, s, 1000 * 60 * 30);
        } else {
            // Refresh _shopify_s
            setCookie(this.sCookieName, s, 1000 * 60 * 30);
        }

        this.y = y;
        this.s = s;
    }

    getHeaders() {
        this.ensureCookies();
        return {
            "Shopify-Storefront-Y": this.y,
            "Shopify-Storefront-S": this.s
        };
    }

    getBasePayload() {
        this.ensureCookies();
        return {
            uniqToken: this.y,
            visitToken: this.s,
            url: window.location.href,
            path: window.location.pathname,
            referrer: document.referrer,
            microSessionId: generateUUID(),
            microSessionCount: 1,
            navigationType: 'navigate',
            navigationApi: 'browser'
        };
    }

    sendMonorailEvent(schemaId, payloadData = {}) {
        try {
            const payload = { ...this.getBasePayload(), ...payloadData };
            const event = {
                schema_id: schemaId,
                payload: payload,
                metadata: {
                    event_created_at_ms: Date.now(),
                    event_sent_at_ms: Date.now()
                }
            };

            fetch('https://monorail-edge.shopifysvc.com/v1/produce', {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain' },
                body: JSON.stringify(event),
                keepalive: true
            }).then(async r => {
                if (!r.ok && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
                    console.warn(`[Shopify Analytics] Schema Validation Error for ${schemaId}:`, r.status, await r.text().catch(()=>''));
                }
            }).catch(() => {});
        } catch (e) {
            // Completely silent in production
        }
    }

    trackPageView() {
        this.sendMonorailEvent(MONORAIL_SCHEMAS.PAGE_VIEW);
    }

    trackProductView(product) {
        this.sendMonorailEvent(MONORAIL_SCHEMAS.PRODUCT_VIEW, {
            product: {
                id: product.id || '',
                title: product.title || '',
                price: parseFloat(product.price) || 0
            }
        });
    }

    trackCollectionView(collection) {
        this.sendMonorailEvent(MONORAIL_SCHEMAS.COLLECTION_VIEW, {
            collection: {
                id: collection.id || '',
                title: collection.title || ''
            }
        });
    }

    trackSearch(query) {
        this.sendMonorailEvent(MONORAIL_SCHEMAS.SEARCH, {
            search_query: query
        });
    }

    trackAddToCart(product, quantity = 1) {
        this.sendMonorailEvent(MONORAIL_SCHEMAS.ADD_TO_CART, {
            cart_line: {
                product: {
                    id: product.id || '',
                    title: product.title || '',
                    price: parseFloat(product.price) || 0
                },
                quantity: quantity
            }
        });
    }

    trackRemoveFromCart(product, quantity = 1) {
        this.sendMonorailEvent(MONORAIL_SCHEMAS.REMOVE_FROM_CART, {
            cart_line: {
                product: {
                    id: product.id || '',
                    title: product.title || '',
                    price: parseFloat(product.price) || 0
                },
                quantity: quantity
            }
        });
    }

    trackCartView(cartItems) {
        this.sendMonorailEvent(MONORAIL_SCHEMAS.CART_VIEW, {
            cart: {
                lines: cartItems.map(item => ({
                    product: {
                        id: item.id || '',
                        title: item.title || '',
                        price: parseFloat(item.price) || 0
                    },
                    quantity: item.qty || 1
                }))
            }
        });
    }

    trackCheckoutStarted(cartItems) {
        this.sendMonorailEvent(MONORAIL_SCHEMAS.CHECKOUT_STARTED, {
            cart: {
                lines: cartItems.map(item => ({
                    product: {
                        id: item.id || '',
                        title: item.title || '',
                        price: parseFloat(item.price) || 0
                    },
                    quantity: item.qty || 1
                }))
            }
        });
    }
}

window.ShopifyAnalytics = new ShopifyAnalytics();
