import re

def main():
    with open('index.html', 'r', encoding='utf-8') as f:
        index_html = f.read()

    # Extract everything before <!-- ══ HERO ════... -->
    head_end_match = re.search(r'<!-- ══ HERO ════+', index_html)
    if head_end_match:
        top_part = index_html[:head_end_match.start()]
    else:
        print("Could not find hero comment.")
        return

    # Extract everything from <!-- ══ WHATSAPP CTA ════... onwards or just Footer
    footer_match = re.search(r'<!-- ══ WHATSAPP CTA ════+', index_html)
    if footer_match:
        bottom_part = index_html[footer_match.start():]
    else:
        print("Could not find footer comment.")
        return

    about_content = """
<!-- ══ ABOUT HERO ═════════════════════════════════════════════════════════ -->
<section class="lm-about-hero fade-up">
    <img src="images/khadi_cotton.jpg" alt="About Adrini Saree Fabric">
    <div class="lm-about-hero-content">
        <div class="lm-about-hero-label">About Adrini</div>
        <h1 class="lm-about-hero-title">Rooted in Heritage,<br>Woven for Today.</h1>
        <p class="lm-about-hero-sub">Celebrating the timeless elegance of Indian sarees through thoughtfully curated collections designed for the modern woman.</p>
    </div>
</section>

<!-- ══ OUR STORY ═════════════════════════════════════════════════════════ -->
<section class="lm-about-story fade-up" style="animation-delay: 0.1s;">
    <div class="lm-about-story-inner">
        <div class="lm-about-story-title">Our Story</div>
        <p>At ADRINI, we believe a saree is more than a garment—it is a reflection of heritage, craftsmanship, and personal expression.</p>
        <p>Inspired by India's rich weaving traditions, ADRINI brings together carefully selected sarees that combine comfort, elegance, and timeless design. From breathable cotton weaves to heritage-inspired drapes, every piece is chosen with attention to quality and detail.</p>
        <p>Our collections are created for women who appreciate tradition while embracing contemporary living. Whether for everyday wear, festive occasions, or special moments, ADRINI sarees are designed to be worn with confidence and grace.</p>
        <div class="highlight">Rooted in heritage, woven for today.</div>
    </div>
</section>

<!-- ══ BRAND VALUES ═══════════════════════════════════════════════════════ -->
<section class="lm-about-values fade-up" style="animation-delay: 0.2s;">
    <div class="lm-about-values-grid">
        <div class="lm-about-value-card">
            <div class="lm-about-value-icon">✦</div>
            <h3 class="lm-about-value-title">Heritage Craftsmanship</h3>
            <p class="lm-about-value-desc">Preserving the beauty of traditional Indian textiles.</p>
        </div>
        <div class="lm-about-value-card">
            <div class="lm-about-value-icon">✦</div>
            <h3 class="lm-about-value-title">Everyday Elegance</h3>
            <p class="lm-about-value-desc">Comfortable sarees designed for modern lifestyles.</p>
        </div>
        <div class="lm-about-value-card">
            <div class="lm-about-value-icon">✦</div>
            <h3 class="lm-about-value-title">Thoughtful Curation</h3>
            <p class="lm-about-value-desc">Every piece is selected for quality, beauty, and versatility.</p>
        </div>
    </div>
</section>

<!-- ══ IMAGE BREAK ════════════════════════════════════════════════════════ -->
<img src="images/mul_cotton.jpg" alt="Adrini Mul Cotton Detail" class="lm-about-image-break fade-up" style="animation-delay: 0.3s;">

<!-- ══ CLOSING ════════════════════════════════════════════════════════════ -->
<section class="lm-about-closing fade-up" style="animation-delay: 0.4s;">
    <p>Every thread tells a story.<br>Every drape celebrates tradition.</p>
    <div class="lm-about-closing-brand">Welcome to ADRINI.</div>
</section>

"""

    final_html = top_part + about_content + bottom_part
    with open('about.html', 'w', encoding='utf-8') as f:
        f.write(final_html)
    print("Created about.html")

if __name__ == "__main__":
    main()
