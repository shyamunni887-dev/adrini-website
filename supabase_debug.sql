SELECT
shopify_customer_id,
email,
jsonb_array_length(wishlist) as wishlist_count,
jsonb_array_length(recently_viewed) as viewed_count,
cart_id
FROM customer_data;
