const fs = require('fs');
const files = ['index.html', 'all-collections.html', 'collection.html'];

files.forEach(file => {
  const path = '/Users/shyam/Documents/Loomyn/' + file;
  if (!fs.existsSync(path)) return;
  let html = fs.readFileSync(path, 'utf8');
  
  // Replace remaining href="collection.html?handle=X" in <a> tags
  // with onclick sessionStorage approach
  html = html.replace(
    /<a([^>]*?)href="collection\.html\?handle=([^"]+)"([^>]*?)>/g,
    (match, pre, handle, post) => {
      // preserve class and other attributes
      const classMatch = (pre + post).match(/class="([^"]+)"/);
      const cls = classMatch ? ` class="${classMatch[1]}"` : '';
      return `<a${pre}href="#"${post} onclick="event.preventDefault(); sessionStorage.setItem('lm-collection-handle','${handle}'); window.location.href='collection.html'">`;
    }
  );

  fs.writeFileSync(path, html);
  console.log('Fixed remaining links in:', file);
});
