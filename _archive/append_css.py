with open("src/styles/index.css", "a", encoding="utf-8") as f:
    f.write("""
/* ── WHY ADRINI ───────────────────────────────────────────── */
.lm-about-why {
  padding: 80px 40px 40px;
  background: #fff;
}
.lm-about-why-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  max-width: 1000px;
  margin: 0 auto;
  align-items: center;
}
.lm-about-why-image img {
  width: 100%;
  aspect-ratio: 4/5;
  object-fit: cover;
  border-radius: 12px;
}
.lm-about-why-text p {
  font-size: 18px;
  line-height: 1.8;
  color: #1a1208;
}
@media (max-width: 768px) {
  .lm-about-why-grid { grid-template-columns: 1fr; gap: 40px; text-align: center; }
}
""")
