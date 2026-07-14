with open("src/styles/index.css", "a", encoding="utf-8") as f:
    f.write("""
/* ── SHIPPING POLICY ───────────────────────────────────────────── */
.lm-policy-hero {
  position: relative;
  width: 100%;
  height: 60vh;
  min-height: 400px;
  background: #000;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  color: #fff;
  overflow: hidden;
}
.lm-policy-hero img {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  object-fit: cover;
  opacity: 0.6;
  z-index: 1;
}
.lm-policy-hero-content {
  position: relative;
  z-index: 2;
  padding: 0 40px;
  max-width: 800px;
}
.lm-policy-hero-label {
  font-size: 11px;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  margin-bottom: 24px;
  color: #c9943a;
}
.lm-policy-hero-title {
  font-size: 56px;
  font-family: 'Cormorant Garamond', serif;
  font-weight: 500;
  line-height: 1.1;
  margin-bottom: 24px;
}
.lm-policy-hero-sub {
  font-size: 16px;
  font-weight: 400;
  opacity: 0.9;
  line-height: 1.6;
  max-width: 600px;
  margin: 0 auto;
}
.lm-policy-container {
  max-width: 800px;
  margin: 80px auto;
  padding: 0 40px;
}
.lm-policy-accordion {
  border-bottom: 1px solid rgba(26,18,8,0.1);
  margin-bottom: 16px;
}
.lm-policy-accordion-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 0;
  cursor: pointer;
  font-size: 18px;
  font-weight: 500;
  color: #1a1208;
  transition: color 0.3s ease;
}
.lm-policy-accordion-header:hover {
  color: #c9943a;
}
.lm-policy-accordion-icon {
  font-size: 20px;
  font-weight: 300;
  transition: transform 0.3s ease;
}
.lm-policy-accordion-body {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.4s ease, padding 0.4s ease;
  font-size: 16px;
  line-height: 1.8;
  color: #6a5d4a;
}
.lm-policy-accordion-body p {
  margin-bottom: 16px;
}
.lm-policy-accordion-body ul {
  padding-left: 20px;
  margin-bottom: 16px;
  list-style: none;
}
.lm-policy-accordion-body li {
  position: relative;
  margin-bottom: 8px;
}
.lm-policy-accordion-body li::before {
  content: '•';
  color: #c9943a;
  position: absolute;
  left: -16px;
}
.lm-policy-accordion.open .lm-policy-accordion-body {
  max-height: 500px;
  padding-bottom: 24px;
}
.lm-policy-accordion.open .lm-policy-accordion-icon {
  transform: rotate(45deg);
}

.lm-policy-timeline-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin: 40px 0;
}
.lm-policy-card {
  padding: 32px 24px;
  text-align: center;
  border: 1px solid rgba(26,18,8,0.08);
  border-radius: 12px;
  background: #fdfcfa;
}
.lm-policy-card-title {
  font-size: 14px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #c9943a;
  margin-bottom: 12px;
}
.lm-policy-card-value {
  font-family: 'Cormorant Garamond', serif;
  font-size: 24px;
  color: #1a1208;
}

.lm-policy-charges {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin: 40px 0;
}
.lm-policy-charge-box {
  padding: 32px;
  border: 1px solid rgba(26,18,8,0.08);
  border-radius: 12px;
  background: #fff;
}
.lm-policy-charge-title {
  font-size: 18px;
  font-weight: 500;
  margin-bottom: 16px;
  color: #1a1208;
}
.lm-policy-charge-text {
  font-size: 15px;
  line-height: 1.6;
  color: #6a5d4a;
}
.lm-policy-charge-text strong {
  color: #085041;
}

@media (max-width: 768px) {
  .lm-policy-hero-title { font-size: 40px; }
  .lm-policy-timeline-cards, .lm-policy-charges { grid-template-columns: 1fr; }
}
""")
