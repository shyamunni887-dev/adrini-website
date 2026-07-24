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

const SHOP_ID = 76900401325;
const APP_CLIENT_ID = '12875497473'; // Headless App Client ID
const TREKKIE_SCHEMA = 'trekkie_storefront_page_view/1.4';
const CUSTOM_SCHEMA = 'custom_storefront_customer_tracking/1.2';

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
            setCookie(this.yCookieName, y, 1000 * 60 * 60 * 24 * 365);
        }
        
        let s = getCookie(this.sCookieName);
        if (!s) {
            s = generateUUID();
            setCookie(this.sCookieName, s, 1000 * 60 * 30);
        } else {
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

    getTrekkiePayload(pageType) {
        return {
            appClientId: APP_CLIENT_ID,
            isMerchantRequest: false,
            hydrogenSubchannelId: '0',
            isPersistentCookie: true,
            uniqToken: this.y,
            visitToken: this.s,
            microSessionId: generateUUID(),
            microSessionCount: 1,
            url: window.location.href,
            path: window.location.pathname,
            search: window.location.search,
            referrer: document.referrer,
            title: document.title,
            shopId: SHOP_ID,
            currency: 'INR',
            contentLanguage: 'en',
            pageType: pageType || 'index',
            customerId: 0,
            resourceType: undefined,
            resourceId: 0
        };
    }

    getCustomPayload(eventName, additionalData = {}) {
        return {
            event_name: eventName,
            canonical_url: window.location.href,
            customer_id: 0,
            source: 'headless',
            asset_version_id: '1.0.0',
            hydrogenSubchannelId: '0',
            is_persistent_cookie: true,
            deprecated_visit_token: this.s,
            unique_token: this.y,
            event_time: Date.now(),
            event_id: generateUUID(),
            event_source_url: window.location.href,
            referrer: document.referrer,
            user_agent: navigator.userAgent,
            navigation_type: 'navigate',
            navigation_api: 'PerformanceNavigationTiming',
            shop_id: SHOP_ID,
            currency: 'INR',
            ccpa_enforced: false,
            gdpr_enforced: false,
            gdpr_enforced_as_string: 'false',
            analytics_allowed: true,
            marketing_allowed: true,
            sale_of_data_allowed: true,
            ...additionalData
        };
    }

    sendBatchEvents(events) {
        try {
            const batch = {
                events: events.map(e => ({
                    schema_id: e.schemaId,
                    payload: e.payload,
                    metadata: { event_created_at_ms: Date.now() }
                })),
                metadata: {
                    event_sent_at_ms: Date.now()
                }
            };

            fetch('https://monorail-edge.shopifysvc.com/unstable/produce_batch', {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain' },
                body: JSON.stringify(batch),
                keepalive: true
            }).then(async r => {
                if (!r.ok && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
                    console.warn(`[Shopify Analytics] Batch Error:`, r.status, await r.text().catch(()=>''));
                }
            }).catch(() => {});
        } catch (e) {
            // Completely silent in production
        }
    }

    trackPageView() {
        this.ensureCookies();
        this.sendBatchEvents([
            {
                schemaId: TREKKIE_SCHEMA,
                payload: this.getTrekkiePayload('index')
            },
            {
                schemaId: CUSTOM_SCHEMA,
                payload: this.getCustomPayload('page_rendered')
            }
        ]);
    }

    trackProductView(product) {
        this.ensureCookies();
        
        let products = [
            JSON.stringify({
                product_gid: `gid://shopify/Product/${product.id || 0}`,
                name: product.title || '',
                price: parseFloat(product.price) || 0,
                quantity: 1
            })
        ];

        this.sendBatchEvents([
            {
                schemaId: CUSTOM_SCHEMA,
                payload: this.getCustomPayload('product_page_rendered', {
                    products: products,
                    total_value: parseFloat(product.price) || 0
                })
            }
        ]);
    }

    trackCollectionView(collection) {
        this.ensureCookies();
        this.sendBatchEvents([
            {
                schemaId: CUSTOM_SCHEMA,
                payload: this.getCustomPayload('collection_page_rendered', {
                    collection_name: collection.title || '',
                    collection_id: parseInt(collection.id || 0)
                })
            }
        ]);
    }

    trackSearch(query) {
        this.ensureCookies();
        this.sendBatchEvents([
            {
                schemaId: CUSTOM_SCHEMA,
                payload: this.getCustomPayload('search_submitted', {
                    search_string: query
                })
            }
        ]);
    }

    getCartToken() {
        let t = getCookie('_shopify_cart_token');
        if (!t) {
            t = generateUUID();
            setCookie('_shopify_cart_token', t, 1000 * 60 * 60 * 24 * 7); // 7 days
        }
        return t;
    }

    trackAddToCart(product, quantity = 1) {
        this.ensureCookies();
        
        let products = [
            JSON.stringify({
                product_gid: `gid://shopify/Product/${product.id || 0}`,
                name: product.title || '',
                price: parseFloat(product.price) || 0,
                quantity: quantity
            })
        ];

        this.sendBatchEvents([
            {
                schemaId: CUSTOM_SCHEMA,
                payload: this.getCustomPayload('product_added_to_cart', {
                    products: products,
                    total_value: (parseFloat(product.price) || 0) * quantity,
                    cart_token: this.getCartToken()
                })
            }
        ]);
    }

    trackRemoveFromCart(product, quantity = 1) {
        // Fallback for missing custom events
    }

    trackCartView(cartItems) {
        this.ensureCookies();
        
        let products = cartItems.map(item => JSON.stringify({
            product_gid: `gid://shopify/Product/${item.id || 0}`,
            name: item.title || '',
            price: parseFloat(item.price) || 0,
            quantity: item.qty || 1
        }));
        
        let total = cartItems.reduce((sum, item) => sum + (parseFloat(item.price) || 0) * (item.qty || 1), 0);

        this.sendBatchEvents([
            {
                schemaId: TREKKIE_SCHEMA,
                payload: this.getTrekkiePayload('cart')
            },
            {
                schemaId: CUSTOM_SCHEMA,
                payload: this.getCustomPayload('cart_viewed', {
                    products: products,
                    total_value: total,
                    cart_token: this.getCartToken()
                })
            }
        ]);
    }

    trackCheckoutStarted(cartItems) {
        this.ensureCookies();
        
        let products = cartItems.map(item => JSON.stringify({
            product_gid: `gid://shopify/Product/${item.id || 0}`,
            name: item.title || '',
            price: parseFloat(item.price) || 0,
            quantity: item.qty || 1
        }));
        
        let total = cartItems.reduce((sum, item) => sum + (parseFloat(item.price) || 0) * (item.qty || 1), 0);

        this.sendBatchEvents([
            {
                schemaId: CUSTOM_SCHEMA,
                payload: this.getCustomPayload('checkout_started', {
                    products: products,
                    total_value: total,
                    cart_token: this.getCartToken()
                })
            }
        ]);
    }
}

window.ShopifyAnalytics = new ShopifyAnalytics();
