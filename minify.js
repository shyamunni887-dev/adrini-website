const { execSync } = require('child_process');

console.log('Minifying CSS...');
execSync('npx clean-css-cli src/styles/index.css -o src/styles/index.css', { stdio: 'inherit' });

console.log('Minifying JS...');
execSync('npx terser src/scripts/main.js -o src/scripts/main.js -c -m', { stdio: 'inherit' });

console.log('Minification complete!');
