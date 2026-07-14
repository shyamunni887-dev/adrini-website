with open("src/styles/index.css", "a", encoding="utf-8") as f:
    f.write("""
/* ── RETURNS PAGE ───────────────────────────────────────────── */
.lm-returns-process-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin: 40px 0;
}
.lm-returns-step-card {
  padding: 36px 28px;
  border: 1px solid rgba(26,18,8,0.08);
  border-radius: 12px;
  background: #fdfcfa;
  text-align: center;
}
.lm-returns-step-num {
  font-family: 'Cormorant Garamond', serif;
  font-size: 40px;
  color: #c9943a;
  opacity: 0.6;
  line-height: 1;
  margin-bottom: 16px;
}
.lm-returns-step-title {
  font-size: 16px;
  font-weight: 600;
  color: #1a1208;
  margin-bottom: 10px;
}
.lm-returns-step-desc {
  font-size: 14px;
  line-height: 1.6;
  color: #6a5d4a;
}
.lm-returns-trust {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin: 60px 0;
  padding: 48px 40px;
  background: #f8f4ec;
  border-radius: 16px;
  text-align: center;
}
.lm-returns-trust-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}
.lm-returns-trust-check {
  width: 42px; height: 42px;
  border-radius: 50%;
  background: #1a1208;
  display: flex; align-items: center; justify-content: center;
  color: #c9943a;
  font-size: 18px;
  flex-shrink: 0;
}
.lm-returns-trust-label {
  font-size: 13px;
  font-weight: 500;
  color: #1a1208;
}
.lm-returns-section-title {
  font-size: 18px;
  font-weight: 500;
  color: #1a1208;
  border-bottom: 1px solid rgba(26,18,8,0.1);
  padding-bottom: 16px;
  margin-top: 48px;
  margin-bottom: 24px;
}
@media (max-width: 768px) {
  .lm-returns-process-grid { grid-template-columns: 1fr; }
  .lm-returns-trust { grid-template-columns: repeat(2, 1fr); }
}
""")
print("CSS appended.")
