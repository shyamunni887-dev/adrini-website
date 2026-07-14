const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function processImage(inputPath, width, prefix) {
  console.log(`Processing ${inputPath} to ${width}px...`);
  const buffer = fs.readFileSync(inputPath);
  const image = sharp(buffer);
  
  // Resize
  const resized = image.resize({ width: width, withoutEnlargement: true });
  
  // AVIF
  await resized.avif({ quality: 60, effort: 6 }).toFile(path.join('images', `${prefix}.avif`));
  
  // WebP
  await resized.webp({ quality: 80 }).toFile(path.join('images', `${prefix}.webp`));
  
  // JPG
  await resized.jpeg({ quality: 80, progressive: true }).toFile(path.join('images', `${prefix}.jpg`));
}

async function run() {
  await processImage('images/desktop_hero.jpg', 1600, 'desktop_hero');
  await processImage('images/mobile_hero.jpg', 800, 'mobile_hero');
  console.log('Done!');
}

run();
