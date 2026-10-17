import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function generateIcons() {
  const svgPath = path.resolve('public/favicon.svg');
  const svgBuffer = fs.readFileSync(svgPath);

  // 192x192 PNG
  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.resolve('public/icon-192.png'));
  console.log('Generated public/icon-192.png');

  // 512x512 PNG
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.resolve('public/icon-512.png'));
  console.log('Generated public/icon-512.png');

  // 180x180 Apple Touch Icon (iOS home screen)
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.resolve('public/apple-touch-icon.png'));
  console.log('Generated public/apple-touch-icon.png');

  // Maskable 512x512 with safe-zone margin (padded on background)
  const innerIcon = await sharp(svgBuffer)
    .resize(400, 400)
    .toBuffer();

  await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 226, g: 125, b: 24, alpha: 1 }, // #E27D18 brand background
    },
  })
    .composite([{ input: innerIcon, top: 56, left: 56 }])
    .png()
    .toFile(path.resolve('public/icon-maskable-512.png'));
  console.log('Generated public/icon-maskable-512.png');
}

generateIcons().catch((err) => {
  console.error(err);
  process.exit(1);
});
