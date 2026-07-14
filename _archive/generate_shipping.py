import re

def main():
    with open('about.html', 'r', encoding='utf-8') as f:
        html = f.read()

    # Extract header up to the About Hero
    head_match = re.search(r'<!-- ══ ABOUT HERO ════+', html)
    if not head_match:
        print("Could not find about hero comment.")
        return
    top_part = html[:head_match.start()]

    # Extract footer from WhatsApp CTA onwards
    footer_match = re.search(r'<!-- ══ WHATSAPP CTA ════+', html)
    if not footer_match:
        print("Could not find footer comment.")
        return
    bottom_part = html[footer_match.start():]

    shipping_content = """
<!-- ══ SHIPPING HERO ══════════════════════════════════════════════════════ -->
<section class="lm-policy-hero fade-up">
    <img src="images/khadi_cotton.jpg" alt="Shipping Policy Fabric">
    <div class="lm-policy-hero-content">
        <div class="lm-policy-hero-label">Shipping Policy</div>
        <h1 class="lm-policy-hero-title">Delivering Timeless Elegance<br>Across India</h1>
        <p class="lm-policy-hero-sub">Everything you need to know about order processing, shipping, tracking, and delivery.</p>
    </div>
</section>

<!-- ══ POLICY CONTENT ═════════════════════════════════════════════════════ -->
<div class="lm-policy-container fade-up" style="animation-delay: 0.1s;">
    
    <!-- ACCORDION 1: ORDER PROCESSING -->
    <div class="lm-policy-accordion open">
        <div class="lm-policy-accordion-header">
            Order Processing
            <span class="lm-policy-accordion-icon">+</span>
        </div>
        <div class="lm-policy-accordion-body">
            <p>Orders are processed within 24–48 hours after confirmation.</p>
            <p>Orders placed on Sundays or public holidays will be processed on the next business day.</p>
            <p>Once dispatched, tracking details will be shared via Email and WhatsApp.</p>
        </div>
    </div>

    <!-- TIMELINE CARDS -->
    <div style="margin-top: 40px; margin-bottom: 24px; font-size: 18px; font-weight: 500; color: #1a1208; border-bottom: 1px solid rgba(26,18,8,0.1); padding-bottom: 16px;">Delivery Timeline</div>
    <div class="lm-policy-timeline-cards">
        <div class="lm-policy-card">
            <div class="lm-policy-card-title">Kerala</div>
            <div class="lm-policy-card-value">2–4 Business Days</div>
        </div>
        <div class="lm-policy-card">
            <div class="lm-policy-card-title">South India</div>
            <div class="lm-policy-card-value">3–5 Business Days</div>
        </div>
        <div class="lm-policy-card">
            <div class="lm-policy-card-title">Rest of India</div>
            <div class="lm-policy-card-value">4–7 Business Days</div>
        </div>
    </div>

    <!-- SHIPPING CHARGES -->
    <div style="margin-top: 40px; margin-bottom: 24px; font-size: 18px; font-weight: 500; color: #1a1208; border-bottom: 1px solid rgba(26,18,8,0.1); padding-bottom: 16px;">Shipping Charges</div>
    <div class="lm-policy-charges">
        <div class="lm-policy-charge-box">
            <div class="lm-policy-charge-title">Prepaid Orders</div>
            <div class="lm-policy-charge-text">
                <strong style="font-size: 20px; display: block; margin-bottom: 8px;">✓ Free Shipping Across India</strong>
                All prepaid orders via UPI, Credit Card, or Net Banking ship absolutely free.
            </div>
        </div>
        <div class="lm-policy-charge-box">
            <div class="lm-policy-charge-title">Cash on Delivery</div>
            <div class="lm-policy-charge-text">
                COD available on eligible orders.<br>
                Additional charges may apply at checkout depending on your pincode.
            </div>
        </div>
    </div>

    <!-- ACCORDION 2: ORDER TRACKING -->
    <div class="lm-policy-accordion">
        <div class="lm-policy-accordion-header">
            Order Tracking
            <span class="lm-policy-accordion-icon">+</span>
        </div>
        <div class="lm-policy-accordion-body">
            <p>Once your order is shipped, you will receive:</p>
            <ul>
                <li>Tracking Number</li>
                <li>Courier Partner Details</li>
                <li>Tracking Link</li>
            </ul>
            <p>via Email and WhatsApp.</p>
        </div>
    </div>

    <!-- ACCORDION 3: DELAYED DELIVERIES -->
    <div class="lm-policy-accordion">
        <div class="lm-policy-accordion-header">
            Delayed Deliveries
            <span class="lm-policy-accordion-icon">+</span>
        </div>
        <div class="lm-policy-accordion-body">
            <p>Occasionally, deliveries may be delayed due to:</p>
            <ul>
                <li>Weather conditions</li>
                <li>Public holidays</li>
                <li>Remote locations</li>
                <li>Courier disruptions</li>
            </ul>
            <p>If your order is affected, our support team will assist you.</p>
        </div>
    </div>

    <!-- ACCORDION 4: DAMAGED OR INCORRECT ORDERS -->
    <div class="lm-policy-accordion">
        <div class="lm-policy-accordion-header">
            Damaged or Incorrect Orders
            <span class="lm-policy-accordion-icon">+</span>
        </div>
        <div class="lm-policy-accordion-body">
            <p>If you receive:</p>
            <ul>
                <li>Damaged products</li>
                <li>Incorrect items</li>
                <li>Missing items</li>
            </ul>
            <p>Please contact us within 48 hours of delivery along with photos of the package and product.</p>
        </div>
    </div>

</div>

<!-- ══ CLOSING ════════════════════════════════════════════════════════════ -->
<section class="lm-about-closing fade-up" style="animation-delay: 0.4s;">
    <p>Every order is carefully packed.<br>Every delivery carries a piece of heritage.</p>
    <div class="lm-about-closing-brand">Thank you for choosing ADRINI.</div>
</section>
"""

    final_html = top_part + shipping_content + bottom_part
    with open('shipping.html', 'w', encoding='utf-8') as f:
        f.write(final_html)
    print("Created shipping.html")

if __name__ == "__main__":
    main()
