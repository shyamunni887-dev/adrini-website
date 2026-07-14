import { generate } from 'critical';
import fs from 'fs';

async function run() {
  try {
    const { css, html, uncritical } = await generate({
      base: '.',
      src: 'index.html',
      width: 1300,
      height: 900,
      inline: false,
      extract: false,
      dimensions: [
        { height: 500, width: 300 },
        { height: 900, width: 1300 }
      ]
    });
    fs.writeFileSync('critical.css', css);
    console.log('Critical CSS generated!');
  } catch (err) {
    console.error('Failed to generate critical CSS:', err);
  }
}
run();
