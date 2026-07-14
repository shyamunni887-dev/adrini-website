import re
import glob

def generate():
    with open('about.html', 'r', encoding='utf-8') as f:
        html = f.read()

    head_match = re.search(r'<!-- ══ ABOUT HERO ════+', html)
    if not head_match:
        print("Could not find about hero comment.")
        return
    top_part = html[:head_match.start()]

    footer_match = re.search(r'<!-- ══ WHATSAPP CTA ════+', html)
    if not footer_match:
        print("Could not find footer comment.")
        return
    bottom_part = html[footer_match.start():]

    returns_content = """
<!-- ══ RETURNS HERO ═══════════════════════════════════════════════════════ -->
<section class="lm-policy-hero fade-up">
    <img src="images/kalyani_cotton.jpg" alt="Returns & Refunds Fabric">
    <div class="lm-policy-hero-content">
        <div class="lm-policy-hero-label">Returns &amp; Refunds</div>
        <h1 class="lm-policy-hero-title">Shop with Confidence</h1>
        <p class="lm-policy-hero-sub">We want every ADRINI saree to be a piece you'll love.<br>If something isn't right, we're here to help.</p>
    </div>
</section>

<!-- ══ RETURNS CONTENT ════════════════════════════════════════════════════ -->
<div class="lm-policy-container fade-up" style="animation-delay: 0.1s;">

    <!-- 7-DAY EASY RETURNS -->
    <div class="lm-returns-section-title">7-Day Easy Returns</div>
    <div class="lm-policy-accordion open">
        <div class="lm-policy-accordion-header">
            Eligibility Criteria
            <span class="lm-policy-accordion-icon">+</span>
        </div>
        <div class="lm-policy-accordion-body">
            <p>You may request a return within 7 days of receiving your order.</p>
            <p>To be eligible for a return:</p>
            <ul>
                <li>Product must be unused</li>
                <li>Original tags must be attached</li>
                <li>Product must be in original packaging</li>
                <li>Item should be free from stains, damage, or alterations</li>
            </ul>
        </div>
    </div>

    <!-- RETURN PROCESS CARDS -->
    <div class="lm-returns-section-title">Return Process</div>
    <div class="lm-returns-process-grid">
        <div class="lm-returns-step-card">
            <div class="lm-returns-step-num">01</div>
            <div class="lm-returns-step-title">Submit Request</div>
            <div class="lm-returns-step-desc">Contact us via WhatsApp or Email within 7 days of delivery.</div>
        </div>
        <div class="lm-returns-step-card">
            <div class="lm-returns-step-num">02</div>
            <div class="lm-returns-step-title">Return Approval</div>
            <div class="lm-returns-step-desc">Our team reviews your request and provides return instructions.</div>
        </div>
        <div class="lm-returns-step-card">
            <div class="lm-returns-step-num">03</div>
            <div class="lm-returns-step-title">Refund Processed</div>
            <div class="lm-returns-step-desc">Once received and inspected, your refund is initiated promptly.</div>
        </div>
    </div>

    <!-- NON-RETURNABLE -->
    <div class="lm-policy-accordion">
        <div class="lm-policy-accordion-header">
            Non-Returnable Items
            <span class="lm-policy-accordion-icon">+</span>
        </div>
        <div class="lm-policy-accordion-body">
            <p>The following items cannot be returned:</p>
            <ul>
                <li>Sarees damaged after delivery</li>
                <li>Products without original tags</li>
                <li>Altered or used products</li>
                <li>Clearance or final-sale items (if applicable)</li>
            </ul>
        </div>
    </div>

    <!-- REFUND TIMELINE -->
    <div class="lm-policy-accordion">
        <div class="lm-policy-accordion-header">
            Refund Timeline
            <span class="lm-policy-accordion-icon">+</span>
        </div>
        <div class="lm-policy-accordion-body">
            <p>After the returned item passes inspection:</p>
            <ul>
                <li>Refunds are processed within 3–7 business days</li>
                <li>Amount is credited to the original payment method</li>
                <li>COD refunds are processed via bank transfer</li>
            </ul>
        </div>
    </div>

    <!-- DAMAGED OR INCORRECT -->
    <div class="lm-policy-accordion">
        <div class="lm-policy-accordion-header">
            Damaged or Incorrect Orders
            <span class="lm-policy-accordion-icon">+</span>
        </div>
        <div class="lm-policy-accordion-body">
            <p>Received a damaged or incorrect item? Please contact us within 48 hours of delivery with:</p>
            <ul>
                <li>Order Number</li>
                <li>Product Photos</li>
                <li>Package Photos</li>
            </ul>
            <p>Our team will resolve the issue as quickly as possible.</p>
        </div>
    </div>

    <!-- TRUST STRIP -->
    <div class="lm-returns-trust">
        <div class="lm-returns-trust-item">
            <div class="lm-returns-trust-check">✓</div>
            <div class="lm-returns-trust-label">7-Day Returns</div>
        </div>
        <div class="lm-returns-trust-item">
            <div class="lm-returns-trust-check">✓</div>
            <div class="lm-returns-trust-label">Quick Refunds</div>
        </div>
        <div class="lm-returns-trust-item">
            <div class="lm-returns-trust-check">✓</div>
            <div class="lm-returns-trust-label">WhatsApp Support</div>
        </div>
        <div class="lm-returns-trust-item">
            <div class="lm-returns-trust-check">✓</div>
            <div class="lm-returns-trust-label">Secure Shopping</div>
        </div>
    </div>

</div>

<!-- ══ CLOSING ════════════════════════════════════════════════════════════ -->
<section class="lm-about-closing fade-up" style="animation-delay: 0.4s;">
    <p>Every saree is chosen with care.<br>Every order is backed by our promise.</p>
    <div class="lm-about-closing-brand">Thank you for shopping with ADRINI.</div>
</section>
"""

    final_html = top_part + returns_content + bottom_part
    with open('returns.html', 'w', encoding='utf-8') as f:
        f.write(final_html)
    print("Created returns.html")


def update_links():
    html_files = glob.glob('**/*.html', recursive=True)
    for filename in html_files:
        with open(filename, 'r', encoding='utf-8') as f:
            content = f.read()
        old = '<a href="#" class="lm-footer-link">Returns</a>'
        new = '<a href="returns.html" class="lm-footer-link">Returns</a>'
        if old in content:
            content = content.replace(old, new)
            with open(filename, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Updated Returns link in {filename}")


if __name__ == "__main__":
    generate()
    update_links()
