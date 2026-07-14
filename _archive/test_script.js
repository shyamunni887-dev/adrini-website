const p = { title: "Women's Saree" };
const safeTitle = p.title.replace(/'/g, "\\'");
const html = `<button onclick="test('${safeTitle}')">Click</button>`;
console.log(html);
