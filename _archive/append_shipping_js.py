with open("src/scripts/main.js", "a", encoding="utf-8") as f:
    f.write("""
// ── SHIPPING POLICY ACCORDIONS ──────────────────────────────────────────────
function initPolicyAccordions() {
    const accordions = document.querySelectorAll('.lm-policy-accordion');
    accordions.forEach(acc => {
        const header = acc.querySelector('.lm-policy-accordion-header');
        if (header) {
            header.addEventListener('click', () => {
                const isOpen = acc.classList.contains('open');
                // Close all others
                accordions.forEach(a => a.classList.remove('open'));
                // Toggle current
                if (!isOpen) {
                    acc.classList.add('open');
                }
            });
        }
    });
}
document.addEventListener('DOMContentLoaded', initPolicyAccordions);
""")
