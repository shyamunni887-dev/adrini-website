const fs = require('fs');
const files = ['index.html', 'all-collections.html', 'collection.html'];

files.forEach(file => {
  const path = '/Users/shyam/Documents/Loomyn/' + file;
  if (!fs.existsSync(path)) return;
  let html = fs.readFileSync(path, 'utf8');
  
  // Replace all onclick with window.location.href='collection.html?handle=X'
  // with sessionStorage + navigate approach
  html = html.replace(
    /window\.location\.href='collection\.html\?handle=([^']+)'/g,
    (match, handle) => `(sessionStorage.setItem('lm-collection-handle','${handle}'), window.location.href='collection.html')`
  );
  html = html.replace(
    /window\.location\.href="collection\.html\?handle=([^"]+)"/g,
    (match, handle) => `(sessionStorage.setItem('lm-collection-handle','${handle}'), window.location.href='collection.html')`
  );
  
  fs.writeFileSync(path, html);
  console.log('Fixed:', file);
});
