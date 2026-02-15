import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logoPath = path.join(__dirname, '..', 'public', 'plan-todos-logo.png');
const publicDir = path.join(__dirname, '..', 'public');
const srcAppDir = path.join(__dirname, '..', 'src', 'app');
const iconsDir = path.join(__dirname, '..', 'src-tauri', 'icons');

async function generateIcons() {
  // Read the source logo
  const logoBuffer = fs.readFileSync(logoPath);
  const logo = sharp(logoBuffer);
  
  // Get original dimensions
  const metadata = await logo.metadata();
  console.log(`Original logo: ${metadata.width}x${metadata.height}`);
  
  // 1. Web Favicon - public/favicon.png (32x32)
  await logo
    .resize(32, 32)
    .png()
    .toFile(path.join(publicDir, 'favicon.png'));
  console.log('Created public/favicon.png (32x32)');
  
  // 2. Web Favicon ICO - public/favicon.ico (multi-size)
  // For ICO, we need to create sizes: 16, 32, 48
  const ico16 = await logo.resize(16, 16).png();
  const ico32 = await logo.resize(32, 32).png();
  const ico48 = await logo.resize(48, 48).png();
  
  // Write ICO (using 32x32 as the main file, real ICO requires special handling)
  await logo
    .resize(32, 32)
    .png()
    .toFile(path.join(publicDir, 'favicon.ico'));
  console.log('Created public/favicon.ico');
  
  // 3. Next.js favicon - src/app/favicon.ico
  await logo
    .resize(32, 32)
    .png()
    .toFile(path.join(srcAppDir, 'favicon.ico'));
  console.log('Created src/app/favicon.ico');
  
  // 4. Tauri Icons
  // 32x32.png
  await logo
    .resize(32, 32)
    .png()
    .toFile(path.join(iconsDir, '32x32.png'));
  console.log('Created src-tauri/icons/32x32.png');
  
  // 128x128.png
  await logo
    .resize(128, 128)
    .png()
    .toFile(path.join(iconsDir, '128x128.png'));
  console.log('Created src-tauri/icons/128x128.png');
  
  // 128x128@2x.png (256x256)
  await logo
    .resize(256, 256)
    .png()
    .toFile(path.join(iconsDir, '128x128@2x.png'));
  console.log('Created src-tauri/icons/128x128@2x.png');
  
  // icon.png (512x512 for source)
  await logo
    .resize(512, 512)
    .png()
    .toFile(path.join(iconsDir, 'icon.png'));
  console.log('Created src-tauri/icons/icon.png');
  
  // icon.ico (Windows) - using 256x256 for quality
  await logo
    .resize(256, 256)
    .png()
    .toFile(path.join(iconsDir, 'icon.ico'));
  console.log('Created src-tauri/icons/icon.ico');
  
  // icon.icns (macOS) - just copy as png for now, real icns needs special tool
  await logo
    .resize(512, 512)
    .png()
    .toFile(path.join(iconsDir, 'icon.icns'));
  console.log('Created src-tauri/icons/icon.icns');
  
  // Square logos (Windows Store)
  const squareSizes = [
    { name: 'Square30x30.png', size: 30 },
    { name: 'Square44x44.png', size: 44 },
    { name: 'Square71x71.png', size: 71 },
    { name: 'Square89x89.png', size: 89 },
    { name: 'Square107x107.png', size: 107 },
    { name: 'Square142x142.png', size: 142 },
    { name: 'Square150x150.png', size: 150 },
    { name: 'Square284x284.png', size: 284 },
    { name: 'Square310x310.png', size: 310 },
    { name: 'StoreLogo.png', size: 50 },
  ];
  
  for (const { name, size } of squareSizes) {
    await logo
      .resize(size, size)
      .png()
      .toFile(path.join(iconsDir, name));
    console.log(`Created src-tauri/icons/${name} (${size}x${size})`);
  }
  
  // iOS App Icons
  const iosSizes = [
    { name: 'AppIcon-20x20@1x.png', size: 20 },
    { name: 'AppIcon-20x20@2x.png', size: 40 },
    { name: 'AppIcon-20x20@3x.png', size: 60 },
    { name: 'AppIcon-29x29@1x.png', size: 29 },
    { name: 'AppIcon-29x29@2x.png', size: 58 },
    { name: 'AppIcon-29x29@3x.png', size: 87 },
    { name: 'AppIcon-40x40@1x.png', size: 40 },
    { name: 'AppIcon-40x40@2x.png', size: 80 },
    { name: 'AppIcon-40x40@3x.png', size: 120 },
    { name: 'AppIcon-60x60@2x.png', size: 120 },
    { name: 'AppIcon-60x60@3x.png', size: 180 },
    { name: 'AppIcon-76x76@1x.png', size: 76 },
    { name: 'AppIcon-76x76@2x.png', size: 152 },
    { name: 'AppIcon-83.5x83.5@2x.png', size: 167 },
    { name: 'AppIcon-512@2x.png', size: 1024 },
  ];
  
  for (const { name, size } of iosSizes) {
    await logo
      .resize(size, size)
      .png()
      .toFile(path.join(iconsDir, 'ios', name));
    console.log(`Created src-tauri/icons/ios/${name} (${size}x${size})`);
  }
  
  // Android Icons
  const androidSizes = [
    { name: 'mdpi/ic_launcher.png', size: 48 },
    { name: 'hdpi/ic_launcher.png', size: 72 },
    { name: 'xhdpi/ic_launcher.png', size: 96 },
    { name: 'xxhdpi/ic_launcher.png', size: 144 },
    { name: 'xxxhdpi/ic_launcher.png', size: 192 },
    { name: 'mdpi/ic_launcher_round.png', size: 48 },
    { name: 'hdpi/ic_launcher_round.png', size: 72 },
    { name: 'xhdpi/ic_launcher_round.png', size: 96 },
    { name: 'xxhdpi/ic_launcher_round.png', size: 144 },
    { name: 'xxxhdpi/ic_launcher_round.png', size: 192 },
    { name: 'mdpi/ic_launcher_foreground.png', size: 108 },
    { name: 'hdpi/ic_launcher_foreground.png', size: 162 },
    { name: 'xhdpi/ic_launcher_foreground.png', size: 216 },
    { name: 'xxhdpi/ic_launcher_foreground.png', size: 324 },
    { name: 'xxxhdpi/ic_launcher_foreground.png', size: 432 },
  ];
  
  for (const { name, size } of androidSizes) {
    const dir = path.join(iconsDir, 'android', path.dirname(name));
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    await logo
      .resize(size, size)
      .png()
      .toFile(path.join(iconsDir, 'android', name));
    console.log(`Created src-tauri/icons/android/${name} (${size}x${size})`);
  }
  
  console.log('\n✅ All icons generated successfully!');
}

generateIcons().catch(console.error);
