with open("src/styles/index.css", "a", encoding="utf-8") as f:
    f.write("""
/* ── CONTACT US PAGE ───────────────────────────────────────────── */
.lm-contact-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 32px;
  margin: 60px auto;
  max-width: 1000px;
}
.lm-contact-card {
  padding: 40px 32px;
  border: 1px solid rgba(26,18,8,0.08);
  border-radius: 12px;
  background: #fdfcfa;
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.lm-contact-card-title {
  font-size: 16px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #c9943a;
  margin-bottom: 16px;
}
.lm-contact-card-desc {
  font-size: 14px;
  line-height: 1.6;
  color: #6a5d4a;
  margin-bottom: 24px;
}
.lm-contact-card-value {
  font-family: 'Cormorant Garamond', serif;
  font-size: 20px;
  color: #1a1208;
  margin-bottom: 24px;
}
.lm-contact-card-action {
  font-size: 14px;
  font-weight: 500;
  color: #1a1208;
  text-decoration: none;
  border-bottom: 1px solid #1a1208;
  padding-bottom: 4px;
  display: inline-block;
  align-self: center;
  transition: opacity 0.2s;
}
.lm-contact-card-action:hover {
  opacity: 0.7;
}

.lm-contact-form-section {
  max-width: 800px;
  margin: 80px auto;
  padding: 48px;
  background: #f8f4ec;
  border-radius: 16px;
}
.lm-contact-form-title {
  font-family: 'Cormorant Garamond', serif;
  font-size: 32px;
  color: #1a1208;
  margin-bottom: 32px;
  text-align: center;
}
.lm-contact-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.lm-contact-form-row {
  display: flex;
  gap: 20px;
}
.lm-contact-form-group {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.lm-contact-input {
  padding: 14px 16px;
  border: 1px solid rgba(26,18,8,0.15);
  border-radius: 8px;
  font-size: 14px;
  font-family: 'Inter', sans-serif;
  color: #1a1208;
  background: #fff;
  outline: none;
  transition: border-color 0.2s;
}
.lm-contact-input:focus {
  border-color: #c9943a;
}
textarea.lm-contact-input {
  resize: vertical;
  min-height: 120px;
}
.lm-contact-submit {
  padding: 16px;
  background: #1a1208;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  margin-top: 10px;
  transition: opacity 0.2s;
}
.lm-contact-submit:hover {
  opacity: 0.9;
}

@media (max-width: 768px) {
  .lm-contact-cards { grid-template-columns: 1fr; }
  .lm-contact-form-row { flex-direction: column; }
  .lm-contact-form-section { padding: 32px 24px; }
}
""")
print("CSS appended.")
