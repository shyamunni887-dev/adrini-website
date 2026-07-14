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

    contact_content = """
<!-- ══ CONTACT HERO ═══════════════════════════════════════════════════════ -->
<section class="lm-policy-hero fade-up">
    <img src="images/mul_cotton.jpg" alt="Contact Adrini">
    <div class="lm-policy-hero-content">
        <div class="lm-policy-hero-label">Contact Us</div>
        <h1 class="lm-policy-hero-title">We're Here to Help</h1>
        <p class="lm-policy-hero-sub">Whether you have a question about an order,<br>a product, or styling advice, we'd love to hear from you.</p>
    </div>
</section>

<!-- ══ CONTACT CONTENT ════════════════════════════════════════════════════ -->
<div class="lm-policy-container fade-up" style="animation-delay: 0.1s; max-width: 1000px;">

    <!-- CONTACT CARDS -->
    <div class="lm-contact-cards">
        <div class="lm-contact-card">
            <div>
                <div class="lm-contact-card-title">WhatsApp Support</div>
                <div class="lm-contact-card-desc">Get quick answers from our team.</div>
                <div class="lm-contact-card-value">Monday – Saturday<br>9:00 AM – 8:00 PM IST</div>
            </div>
            <a href="https://wa.me/919999999999" target="_blank" class="lm-contact-card-action">Chat on WhatsApp &rarr;</a>
        </div>
        <div class="lm-contact-card">
            <div>
                <div class="lm-contact-card-title">Email Support</div>
                <div class="lm-contact-card-desc">For order inquiries and assistance.</div>
                <div class="lm-contact-card-value">support@adrini.in</div>
            </div>
            <a href="mailto:support@adrini.in" class="lm-contact-card-action">Send an Email &rarr;</a>
        </div>
        <div class="lm-contact-card">
            <div>
                <div class="lm-contact-card-title">Business Address</div>
                <div class="lm-contact-card-desc">Serving customers across India.</div>
                <div class="lm-contact-card-value">ADRINI Sarees<br>Kollam, Kerala, India</div>
            </div>
        </div>
    </div>

    <!-- CONTACT FORM -->
    <div class="lm-contact-form-section">
        <h2 class="lm-contact-form-title">Send Us a Message</h2>
        <form class="lm-contact-form" onsubmit="event.preventDefault();">
            <div class="lm-contact-form-row">
                <div class="lm-contact-form-group">
                    <input type="text" class="lm-contact-input" placeholder="Name" required>
                </div>
                <div class="lm-contact-form-group">
                    <input type="email" class="lm-contact-input" placeholder="Email" required>
                </div>
            </div>
            <div class="lm-contact-form-row">
                <div class="lm-contact-form-group">
                    <input type="tel" class="lm-contact-input" placeholder="Phone Number">
                </div>
                <div class="lm-contact-form-group">
                    <input type="text" class="lm-contact-input" placeholder="Subject" required>
                </div>
            </div>
            <div class="lm-contact-form-group">
                <textarea class="lm-contact-input" placeholder="Message" required></textarea>
            </div>
            <button type="submit" class="lm-contact-submit">Send Message</button>
        </form>
    </div>

    <!-- FAQ SECTION -->
    <div class="lm-returns-section-title">Frequently Asked Questions</div>
    <div class="lm-policy-accordion">
        <div class="lm-policy-accordion-header">
            Where is my order?
            <span class="lm-policy-accordion-icon">+</span>
        </div>
        <div class="lm-policy-accordion-body">
            <p>Tracking details are sent via Email and WhatsApp after dispatch.</p>
        </div>
    </div>
    <div class="lm-policy-accordion">
        <div class="lm-policy-accordion-header">
            What is your return policy?
            <span class="lm-policy-accordion-icon">+</span>
        </div>
        <div class="lm-policy-accordion-body">
            <p>Returns can be requested within 7 days of delivery.</p>
        </div>
    </div>
    <div class="lm-policy-accordion">
        <div class="lm-policy-accordion-header">
            Do you offer Cash on Delivery?
            <span class="lm-policy-accordion-icon">+</span>
        </div>
        <div class="lm-policy-accordion-body">
            <p>Yes, COD is available on eligible orders.</p>
        </div>
    </div>

    <!-- TRUST STRIP -->
    <div class="lm-returns-trust">
        <div class="lm-returns-trust-item">
            <div class="lm-returns-trust-check">✓</div>
            <div class="lm-returns-trust-label">Fast WhatsApp Support</div>
        </div>
        <div class="lm-returns-trust-item">
            <div class="lm-returns-trust-check">✓</div>
            <div class="lm-returns-trust-label">Secure Payments</div>
        </div>
        <div class="lm-returns-trust-item">
            <div class="lm-returns-trust-check">✓</div>
            <div class="lm-returns-trust-label">Easy Returns</div>
        </div>
        <div class="lm-returns-trust-item">
            <div class="lm-returns-trust-check">✓</div>
            <div class="lm-returns-trust-label">Pan India Delivery</div>
        </div>
    </div>

</div>

<!-- ══ CLOSING ════════════════════════════════════════════════════════════ -->
<section class="lm-about-closing fade-up" style="animation-delay: 0.4s;">
    <p>Every conversation matters.</p>
    <div class="lm-about-closing-brand">Rooted in heritage, woven for today.</div>
</section>
"""

    final_html = top_part + contact_content + bottom_part
    with open('contact.html', 'w', encoding='utf-8') as f:
        f.write(final_html)
    print("Created contact.html")


def update_links():
    html_files = glob.glob('**/*.html', recursive=True)
    for filename in html_files:
        with open(filename, 'r', encoding='utf-8') as f:
            content = f.read()
        old = '<a href="#" class="lm-footer-link">Contact us</a>'
        new = '<a href="contact.html" class="lm-footer-link">Contact us</a>'
        if old in content:
            content = content.replace(old, new)
            with open(filename, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Updated Contact link in {filename}")


if __name__ == "__main__":
    generate()
    update_links()
