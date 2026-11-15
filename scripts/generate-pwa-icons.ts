import sharp from "sharp";
import fs from "fs";
import path from "path";

const ICONS_DIR = path.join(process.cwd(), "public", "icons");
const PUBLIC_DIR = path.join(process.cwd(), "public");

if (!fs.existsSync(ICONS_DIR)) {
  fs.mkdirSync(ICONS_DIR, { recursive: true });
}

// 1. Standard (purpose: "any") SVG with rounded aesthetic and shadow
function createStandardSvg(size: number): string {
  const cornerRadius = Math.round(size * 0.22); // Modern iOS/Android rounded squircle
  const center = size / 2;
  const compassRadius = size * 0.26;
  const strokeWidth = Math.round(size * 0.035);
  const needleLen = compassRadius * 0.72;
  const needleWidth = compassRadius * 0.32;

  return `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
    <defs>
      <linearGradient id="brandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#10b981" />
        <stop offset="100%" stop-color="#047857" />
      </linearGradient>
      <filter id="dropShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="${Math.round(size * 0.02)}" stdDeviation="${Math.round(size * 0.025)}" flood-color="#064e3b" flood-opacity="0.35"/>
      </filter>
    </defs>

    <!-- Background card -->
    <rect width="${size}" height="${size}" rx="${cornerRadius}" fill="url(#brandGrad)" />

    <!-- Subtle inner highlight -->
    <rect x="${Math.round(size * 0.02)}" y="${Math.round(size * 0.02)}" width="${size - Math.round(size * 0.04)}" height="${size - Math.round(size * 0.04)}" rx="${cornerRadius - 4}" fill="none" stroke="#34d399" stroke-opacity="0.4" stroke-width="${Math.max(1, Math.round(size * 0.008))}" />

    <!-- Outer Compass Ring -->
    <circle cx="${center}" cy="${center}" r="${compassRadius}" fill="none" stroke="#ffffff" stroke-width="${strokeWidth}" filter="url(#dropShadow)" />

    <!-- Compass Cardinal Ticks -->
    <line x1="${center}" y1="${center - compassRadius - strokeWidth * 0.8}" x2="${center}" y2="${center - compassRadius + strokeWidth * 1.5}" stroke="#ffffff" stroke-width="${strokeWidth * 0.9}" stroke-linecap="round" />
    <line x1="${center}" y1="${center + compassRadius - strokeWidth * 1.5}" x2="${center}" y2="${center + compassRadius + strokeWidth * 0.8}" stroke="#ffffff" stroke-width="${strokeWidth * 0.9}" stroke-linecap="round" />
    <line x1="${center - compassRadius - strokeWidth * 0.8}" y1="${center}" x2="${center - compassRadius + strokeWidth * 1.5}" y2="${center}" stroke="#ffffff" stroke-width="${strokeWidth * 0.9}" stroke-linecap="round" />
    <line x1="${center + compassRadius - strokeWidth * 1.5}" y1="${center}" x2="${center + compassRadius + strokeWidth * 0.8}" y2="${center}" stroke="#ffffff" stroke-width="${strokeWidth * 0.9}" stroke-linecap="round" />

    <!-- Dynamic Compass Needles (North / South Diamond) -->
    <!-- North Needle (White) -->
    <polygon points="${center},${center - needleLen} ${center + needleWidth},${center} ${center},${center - needleWidth * 0.4} ${center - needleWidth},${center}" fill="#ffffff" filter="url(#dropShadow)" />

    <!-- South Needle (Semi-transparent / Accent) -->
    <polygon points="${center},${center + needleLen} ${center + needleWidth},${center} ${center},${center + needleWidth * 0.4} ${center - needleWidth},${center}" fill="#a7f3d0" fill-opacity="0.85" />

    <!-- Center Compass Pin -->
    <circle cx="${center}" cy="${center}" r="${Math.round(strokeWidth * 1.3)}" fill="#047857" stroke="#ffffff" stroke-width="${Math.round(strokeWidth * 0.6)}" />
  </svg>
  `.trim();
}

// 2. Maskable (purpose: "maskable") SVG with safe zone (inner 60% circle) and full edge bleed
function createMaskableSvg(size: number): string {
  const center = size / 2;
  // Safe zone for maskable icons is 80% diameter (40% radius); content within 60% avoids all crops
  const compassRadius = size * 0.20;
  const strokeWidth = Math.round(size * 0.028);
  const needleLen = compassRadius * 0.72;
  const needleWidth = compassRadius * 0.32;

  return `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
    <defs>
      <linearGradient id="maskableBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#10b981" />
        <stop offset="100%" stop-color="#047857" />
      </linearGradient>
      <filter id="maskableShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="${Math.round(size * 0.015)}" stdDeviation="${Math.round(size * 0.02)}" flood-color="#064e3b" flood-opacity="0.35"/>
      </filter>
    </defs>

    <!-- Full edge-to-edge solid bleed background -->
    <rect width="${size}" height="${size}" fill="url(#maskableBg)" />

    <!-- Outer Compass Ring in safe zone -->
    <circle cx="${center}" cy="${center}" r="${compassRadius}" fill="none" stroke="#ffffff" stroke-width="${strokeWidth}" filter="url(#maskableShadow)" />

    <!-- Cardinal Ticks -->
    <line x1="${center}" y1="${center - compassRadius - strokeWidth * 0.8}" x2="${center}" y2="${center - compassRadius + strokeWidth * 1.5}" stroke="#ffffff" stroke-width="${strokeWidth * 0.9}" stroke-linecap="round" />
    <line x1="${center}" y1="${center + compassRadius - strokeWidth * 1.5}" x2="${center}" y2="${center + compassRadius + strokeWidth * 0.8}" stroke="#ffffff" stroke-width="${strokeWidth * 0.9}" stroke-linecap="round" />
    <line x1="${center - compassRadius - strokeWidth * 0.8}" y1="${center}" x2="${center - compassRadius + strokeWidth * 1.5}" y2="${center}" stroke="#ffffff" stroke-width="${strokeWidth * 0.9}" stroke-linecap="round" />
    <line x1="${center + compassRadius - strokeWidth * 1.5}" y1="${center}" x2="${center + compassRadius + strokeWidth * 0.8}" y2="${center}" stroke="#ffffff" stroke-width="${strokeWidth * 0.9}" stroke-linecap="round" />

    <!-- North Needle -->
    <polygon points="${center},${center - needleLen} ${center + needleWidth},${center} ${center},${center - needleWidth * 0.4} ${center - needleWidth},${center}" fill="#ffffff" filter="url(#maskableShadow)" />

    <!-- South Needle -->
    <polygon points="${center},${center + needleLen} ${center + needleWidth},${center} ${center},${center + needleWidth * 0.4} ${center - needleWidth},${center}" fill="#a7f3d0" fill-opacity="0.85" />

    <!-- Center Pin -->
    <circle cx="${center}" cy="${center}" r="${Math.round(strokeWidth * 1.3)}" fill="#047857" stroke="#ffffff" stroke-width="${Math.round(strokeWidth * 0.6)}" />
  </svg>
  `.trim();
}

async function generate() {
  console.log("Generating Roomigo PWA Icons...");

  // 1. icon-192x192.png
  await sharp(Buffer.from(createStandardSvg(192)))
    .png({ quality: 100 })
    .toFile(path.join(ICONS_DIR, "icon-192x192.png"));
  console.log("✅ Created public/icons/icon-192x192.png");

  // 2. icon-512x512.png
  await sharp(Buffer.from(createStandardSvg(512)))
    .png({ quality: 100 })
    .toFile(path.join(ICONS_DIR, "icon-512x512.png"));
  console.log("✅ Created public/icons/icon-512x512.png");

  // 3. icon-maskable-192x192.png
  await sharp(Buffer.from(createMaskableSvg(192)))
    .png({ quality: 100 })
    .toFile(path.join(ICONS_DIR, "icon-maskable-192x192.png"));
  console.log("✅ Created public/icons/icon-maskable-192x192.png");

  // 4. icon-maskable-512x512.png
  await sharp(Buffer.from(createMaskableSvg(512)))
    .png({ quality: 100 })
    .toFile(path.join(ICONS_DIR, "icon-maskable-512x512.png"));
  console.log("✅ Created public/icons/icon-maskable-512x512.png");

  // 5. apple-touch-icon.png (180x180)
  await sharp(Buffer.from(createStandardSvg(180)))
    .png({ quality: 100 })
    .toFile(path.join(PUBLIC_DIR, "apple-touch-icon.png"));
  console.log("✅ Created public/apple-touch-icon.png");

  // 6. favicon-32x32.png
  await sharp(Buffer.from(createStandardSvg(32)))
    .png({ quality: 100 })
    .toFile(path.join(PUBLIC_DIR, "favicon-32x32.png"));
  console.log("✅ Created public/favicon-32x32.png");

  console.log("🎉 All PWA icons generated successfully!");
}

generate().catch((err) => {
  console.error("Failed to generate icons:", err);
  process.exit(1);
});
