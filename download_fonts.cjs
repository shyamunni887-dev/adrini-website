const fs = require('fs');
const path = require('path');
const https = require('https');

const fontUrl = "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Inter:wght@300;400;500&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&family=DM+Sans:wght@300;400;500&display=swap";
const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"; // Forces WOFF2

const fontDir = path.join(__dirname, 'fonts');
if (!fs.existsSync(fontDir)) fs.mkdirSync(fontDir);

https.get(fontUrl, { headers: { 'User-Agent': USER_AGENT } }, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', async () => {
    let css = data;
    const urlRegex = /url\((https:\/\/[^)]+)\)/g;
    let match;
    let index = 1;
    
    // Create an array of download promises
    const downloads = [];
    
    while ((match = urlRegex.exec(css)) !== null) {
      const url = match[1];
      const filename = `font-${index}.woff2`;
      const localPath = `/fonts/${filename}`;
      
      // Replace URL in CSS
      css = css.replace(url, localPath);
      
      // Download file
      downloads.push(new Promise((resolve, reject) => {
        const dest = path.join(fontDir, filename);
        const file = fs.createWriteStream(dest);
        https.get(url, (response) => {
          response.pipe(file);
          file.on('finish', () => {
            file.close(resolve);
          });
        }).on('error', (err) => {
          fs.unlink(dest);
          reject(err);
        });
      }));
      
      index++;
    }
    
    await Promise.all(downloads);
    fs.writeFileSync(path.join(fontDir, 'fonts.css'), css);
    console.log('Fonts downloaded successfully!');
  });
});
