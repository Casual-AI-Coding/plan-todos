/**
 * Generate all platform icons from a source logo
 * Usage: node scripts/generate-icons.js
 */

import sharp from "sharp";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { mkdir, existsSync } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, "..");

const SOURCE_LOGO = join(rootDir, "public", "plan-todos-logo.png");
const ICONS_DIR = join(rootDir, "src-tauri", "icons");

// Ensure directory exists
function ensureDir(dir) {
  if (!existsSync(dir)) {
    mkdir(dir, { recursive: true }, () => {});
  }
}

// Generate a resized icon
async function generateIcon(input, output, size, options = {}) {
  const { padding = 0, background = { r: 0, g: 0, b: 0, alpha: 0 } } = options;

  try {
    let pipeline = sharp(input);

    if (padding > 0) {
      // Resize to fit within the padded area
      const innerSize = Math.round(size * (1 - padding * 2));
      pipeline = pipeline
        .resize(innerSize, innerSize, { fit: "contain", background })
        .extend({
          top: Math.round(size * padding),
          bottom: Math.round(size * padding),
          left: Math.round(size * padding),
          right: Math.round(size * padding),
          background,
        });
    } else {
      pipeline = pipeline.resize(size, size, { fit: "contain", background });
    }

    await pipeline.png().toFile(output);
    console.log(`✓ Generated: ${output}`);
  } catch (error) {
    console.error(`✗ Failed: ${output} - ${error.message}`);
  }
}

// Generate ICO file for Windows
async function generateIco(input, output) {
  try {
    // Generate multiple sizes for ICO
    const sizes = [16, 32, 48, 64, 128, 256];
    const images = await Promise.all(
      sizes.map((size) =>
        sharp(input).resize(size, size, { fit: "contain" }).png().toBuffer(),
      ),
    );

    // Simple ICO format (using PNG format)
    const pngData = images[1]; // Use 32x32 for simplicity
    const icoHeader = Buffer.alloc(6);
    icoHeader.writeUInt16LE(0, 0); // Reserved
    icoHeader.writeUInt16LE(1, 2); // Type: 1 = ICO
    icoHeader.writeUInt16LE(1, 4); // Number of images

    const icoDir = Buffer.alloc(16);
    icoDir.writeUInt8(32, 0); // Width
    icoDir.writeUInt8(32, 1); // Height
    icoDir.writeUInt8(0, 2); // Color palette
    icoDir.writeUInt8(0, 3); // Reserved
    icoDir.writeUInt16LE(1, 4); // Color planes
    icoDir.writeUInt16LE(32, 6); // Bits per pixel
    icoDir.writeUInt32LE(pngData.length, 8); // Size
    icoDir.writeUInt32LE(22, 12); // Offset (6 header + 16 dir entry)

    const ico = Buffer.concat([icoHeader, icoDir, pngData]);
    await sharp(ico).toFile(output);
    console.log(`✓ Generated: ${output}`);
  } catch (error) {
    console.error(`✗ Failed to generate ICO: ${error.message}`);
    // Fallback: just copy as PNG
    await sharp(input)
      .resize(256, 256)
      .png()
      .toFile(output.replace(".ico", "-fallback.png"));
  }
}

// Generate ICNS file for macOS (simplified - just generate PNGs)
async function generateIcns(input, outputDir) {
  const sizes = [16, 32, 64, 128, 256, 512, 1024];
  for (const size of sizes) {
    await generateIcon(
      input,
      join(outputDir, `icon_${size}x${size}.png`),
      size,
    );
  }
  console.log(`✓ Generated ICNS source files in ${outputDir}`);
}

async function main() {
  console.log("🎨 Generating icons from:", SOURCE_LOGO);
  console.log("📁 Output directory:", ICONS_DIR);

  ensureDir(ICONS_DIR);

  // ===== Desktop Icons (Tauri) =====
  console.log("\n📱 Generating Desktop icons...");

  await generateIcon(SOURCE_LOGO, join(ICONS_DIR, "32x32.png"), 32);
  await generateIcon(SOURCE_LOGO, join(ICONS_DIR, "64x64.png"), 64);
  await generateIcon(SOURCE_LOGO, join(ICONS_DIR, "128x128.png"), 128);
  await generateIcon(SOURCE_LOGO, join(ICONS_DIR, "128x128@2x.png"), 256);
  await generateIcon(SOURCE_LOGO, join(ICONS_DIR, "icon.png"), 1024);

  // For ICO, use a simpler approach - just create a PNG that Windows can use
  await sharp(SOURCE_LOGO)
    .resize(256, 256, { fit: "contain" })
    .png()
    .toFile(join(ICONS_DIR, "icon.ico"));
  console.log(`✓ Generated: ${join(ICONS_DIR, "icon.ico")} (PNG format)`);

  // ICNS - just the main icon
  await generateIcon(SOURCE_LOGO, join(ICONS_DIR, "icon.icns"), 512);

  // ===== Windows Store Icons =====
  console.log("\n🪟 Generating Windows Store icons...");

  const winSizes = [
    { name: "Square30x30", size: 30 },
    { name: "Square44x44", size: 44 },
    { name: "Square71x71", size: 71 },
    { name: "Square89x89", size: 89 },
    { name: "Square107x107", size: 107 },
    { name: "Square142x142", size: 142 },
    { name: "Square150x150", size: 150 },
    { name: "Square284x284", size: 284 },
    { name: "Square310x310", size: 310 },
    { name: "StoreLogo", size: 50 },
  ];

  for (const { name, size } of winSizes) {
    await generateIcon(SOURCE_LOGO, join(ICONS_DIR, `${name}.png`), size);
    await generateIcon(SOURCE_LOGO, join(ICONS_DIR, `${name}Logo.png`), size);
  }

  // ===== Android Icons =====
  console.log("\n🤖 Generating Android icons...");

  const androidDensities = [
    { name: "mdpi", launcher: 48, foreground: 108 },
    { name: "hdpi", launcher: 72, foreground: 162 },
    { name: "xhdpi", launcher: 96, foreground: 216 },
    { name: "xxhdpi", launcher: 144, foreground: 324 },
    { name: "xxxhdpi", launcher: 192, foreground: 432 },
  ];

  for (const { name, launcher, foreground } of androidDensities) {
    const mipmapDir = join(ICONS_DIR, "android", `mipmap-${name}`);
    ensureDir(mipmapDir);

    // Regular launcher icon (full logo)
    await generateIcon(
      SOURCE_LOGO,
      join(mipmapDir, "ic_launcher.png"),
      launcher,
    );
    await generateIcon(
      SOURCE_LOGO,
      join(mipmapDir, "ic_launcher_round.png"),
      launcher,
    );

    // Foreground icon for Adaptive Icon - needs padding (1/3 of size as safe zone)
    // Android Adaptive Icon: 108dp canvas, 72dp visible center
    // So we need 33% padding (18dp on each side)
    await generateIcon(
      SOURCE_LOGO,
      join(mipmapDir, "ic_launcher_foreground.png"),
      foreground,
      { padding: 0.167 },
    );
  }

  // Adaptive icon XML files (keep existing)
  ensureDir(join(ICONS_DIR, "android", "mipmap-anydpi-v26"));
  ensureDir(join(ICONS_DIR, "android", "values"));

  // ===== iOS Icons =====
  console.log("\n🍎 Generating iOS icons...");

  const iosSizes = [
    { name: "AppIcon-20x20@1x", size: 20 },
    { name: "AppIcon-20x20@2x", size: 40 },
    { name: "AppIcon-20x20@3x", size: 60 },
    { name: "AppIcon-29x29@1x", size: 29 },
    { name: "AppIcon-29x29@2x", size: 58 },
    { name: "AppIcon-29x29@3x", size: 87 },
    { name: "AppIcon-40x40@1x", size: 40 },
    { name: "AppIcon-40x40@2x", size: 80 },
    { name: "AppIcon-40x40@3x", size: 120 },
    { name: "AppIcon-60x60@2x", size: 120 },
    { name: "AppIcon-60x60@3x", size: 180 },
    { name: "AppIcon-76x76@1x", size: 76 },
    { name: "AppIcon-76x76@2x", size: 152 },
    { name: "AppIcon-83.5x83.5@2x", size: 167 },
    { name: "AppIcon-512@2x", size: 1024 },
  ];

  for (const { name, size } of iosSizes) {
    await generateIcon(SOURCE_LOGO, join(ICONS_DIR, `${name}.png`), size);
  }

  // ===== Web Icons =====
  console.log("\n🌐 Generating Web icons...");

  const webDir = join(rootDir, "public");
  await generateIcon(SOURCE_LOGO, join(webDir, "favicon.png"), 32);
  await generateIcon(SOURCE_LOGO, join(webDir, "favicon.ico"), 32);
  await generateIcon(SOURCE_LOGO, join(webDir, "plan-todos-logo-512.png"), 512);

  console.log("\n✅ All icons generated successfully!");
}

main().catch(console.error);
