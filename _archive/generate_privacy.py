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

    privacy_content = """
<!-- ══ PRIVACY HERO ═══════════════════════════════════════════════════════ -->
<section class="lm-policy-hero fade-up">
    <img src="images/banarasi_silk.jpg" alt="Privacy Policy Fabric">
    <div class="lm-policy-hero-content">
        <div class="lm-policy-hero-label">Privacy Policy</div>
        <h1 class="lm-policy-hero-title">Your Privacy Matters</h1>
        <p class="lm-policy-hero-sub">We are committed to protecting your personal information<br>and ensuring a secure shopping experience.</p>
    </div>
</section>

<!-- ══ PRIVACY CONTENT ════════════════════════════════════════════════════ -->
<div class="lm-policy-container fade-up" style="animation-delay: 0.1s; max-width: 1000px;">

    <!-- INTRODUCTION -->
    <div style="font-size: 16px; line-height: 1.8; color: #6a5d4a; margin-bottom: 40px; text-align: center;">
        <p>At ADRINI, we respect your privacy and are committed to protecting your personal information.</p>
        <p>This Privacy Policy explains how we collect, use, and safeguard the information you provide when visiting our website or placing an order.</p>
    </div>

    <!-- ACCORDION: INFORMATION WE COLLECT -->
    <div class="lm-policy-accordion open">
        <div class="lm-policy-accordion-header">
            Information We Collect
            <span class="lm-policy-accordion-icon">+</span>
        </div>
        <div class="lm-policy-accordion-body">
            <h3 style="font-size: 16px; color: #1a1208; margin-bottom: 12px; margin-top: 8px;">Personal Information</h3>
            <p>When you place an order, we may collect:</p>
            <ul>
                <li>Name</li>
                <li>Email Address</li>
                <li>Phone Number</li>
                <li>Shipping Address</li>
                <li>Billing Address</li>
            </ul>
            <h3 style="font-size: 16px; color: #1a1208; margin-bottom: 12px; margin-top: 24px;">Payment Information</h3>
            <p>All payments are processed through secure payment providers.</p>
            <p><strong>ADRINI does not store your debit card, credit card, or banking information.</strong></p>
        </div>
    </div>

    <!-- ACCORDION: HOW WE USE YOUR INFORMATION -->
    <div class="lm-policy-accordion">
        <div class="lm-policy-accordion-header">
            How We Use Your Information
            <span class="lm-policy-accordion-icon">+</span>
        </div>
        <div class="lm-policy-accordion-body">
            <p>We use your information to:</p>
            <ul>
                <li>Process and deliver orders</li>
                <li>Provide customer support</li>
                <li>Send order updates</li>
                <li>Improve our website experience</li>
                <li>Share promotional offers (with your consent)</li>
            </ul>
        </div>
    </div>

    <!-- ACCORDION: COOKIES -->
    <div class="lm-policy-accordion">
        <div class="lm-policy-accordion-header">
            Cookies
            <span class="lm-policy-accordion-icon">+</span>
        </div>
        <div class="lm-policy-accordion-body">
            <p>ADRINI uses cookies to:</p>
            <ul>
                <li>Improve website performance</li>
                <li>Remember user preferences</li>
                <li>Analyze website traffic</li>
                <li>Enhance shopping experience</li>
            </ul>
        </div>
    </div>

    <!-- TRUST STRIP: INFORMATION SECURITY -->
    <div class="lm-returns-section-title">Information Security</div>
    <div class="lm-returns-trust">
        <div class="lm-returns-trust-item">
            <div class="lm-returns-trust-check">✓</div>
            <div class="lm-returns-trust-label">Secure Payments</div>
        </div>
        <div class="lm-returns-trust-item">
            <div class="lm-returns-trust-check">✓</div>
            <div class="lm-returns-trust-label">Encrypted Checkout</div>
        </div>
        <div class="lm-returns-trust-item">
            <div class="lm-returns-trust-check">✓</div>
            <div class="lm-returns-trust-label">Protected Data</div>
        </div>
        <div class="lm-returns-trust-item">
            <div class="lm-returns-trust-check">✓</div>
            <div class="lm-returns-trust-label">Trusted Experience</div>
        </div>
    </div>

    <!-- ACCORDION: THIRD-PARTY SERVICES -->
    <div class="lm-policy-accordion">
        <div class="lm-policy-accordion-header">
            Third-Party Services
            <span class="lm-policy-accordion-icon">+</span>
        </div>
        <div class="lm-policy-accordion-body">
            <p>We may share necessary information with trusted partners such as:</p>
            <ul>
                <li>Payment Providers</li>
                <li>Shipping Partners</li>
                <li>Analytics Services</li>
            </ul>
            <p>These partners only receive information required to perform their services.</p>
        </div>
    </div>

    <!-- ACCORDION: YOUR RIGHTS -->
    <div class="lm-policy-accordion">
        <div class="lm-policy-accordion-header">
            Your Rights
            <span class="lm-policy-accordion-icon">+</span>
        </div>
        <div class="lm-policy-accordion-body">
            <p>You may:</p>
            <ul>
                <li>Request access to your data</li>
                <li>Update your information</li>
                <li>Request deletion of your information</li>
                <li>Unsubscribe from marketing emails</li>
            </ul>
        </div>
    </div>

    <!-- CONTACT US -->
    <div class="lm-returns-section-title" style="margin-top: 60px;">Contact Us</div>
    <div style="font-size: 16px; line-height: 1.8; color: #6a5d4a;">
        <p>If you have any questions regarding this Privacy Policy, please contact us.</p>
        <p style="margin-top: 20px;">
            <strong style="color: #1a1208;">Email:</strong><br>
            <a href="mailto:support@adrini.in" style="color: #c9943a; text-decoration: none;">support@adrini.in</a>
        </p>
        <p style="margin-top: 20px;">
            <strong style="color: #1a1208;">WhatsApp:</strong><br>
            <a href="https://wa.me/917356510301" target="_blank" style="color: #c9943a; text-decoration: none;">+91 7356510301</a>
        </p>
    </div>

</div>

<!-- ══ CLOSING ════════════════════════════════════════════════════════════ -->
<section class="lm-about-closing fade-up" style="animation-delay: 0.4s;">
    <p>Trust is woven into everything we do.</p>
    <div class="lm-about-closing-brand">Thank you for choosing ADRINI.</div>
</section>
"""

    final_html = top_part + privacy_content + bottom_part
    with open('privacy.html', 'w', encoding='utf-8') as f:
        f.write(final_html)
    print("Created privacy.html")


def update_links():
    html_files = glob.glob('**/*.html', recursive=True)
    for filename in html_files:
        with open(filename, 'r', encoding='utf-8') as f:
            content = f.read()
        old = '<a href="#" class="lm-footer-link">Privacy policy</a>'
        new = '<a href="privacy.html" class="lm-footer-link">Privacy policy</a>'
        if old in content:
            content = content.replace(old, new)
            with open(filename, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Updated Privacy link in {filename}")


if __name__ == "__main__":
    generate()
    update_links()
