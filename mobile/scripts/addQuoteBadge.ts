import sharp from 'sharp';
import path from 'path';

const BADGE_SIZE = 120;
const BADGE_MARGIN = 40;

// Create a gold glossy quote badge SVG
function createQuoteBadgeSVG(): Buffer {
  const svg = `
    <svg width="${BADGE_SIZE}" height="${BADGE_SIZE}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <!-- Gold glossy gradient -->
        <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#FFE566;stop-opacity:1" />
          <stop offset="25%" style="stop-color:#FFD700;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#FFC125;stop-opacity:1" />
          <stop offset="75%" style="stop-color:#DAA520;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#B8860B;stop-opacity:1" />
        </linearGradient>
        <!-- Glossy highlight -->
        <linearGradient id="glossHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#FFFFFF;stop-opacity:0.6" />
          <stop offset="40%" style="stop-color:#FFFFFF;stop-opacity:0.1" />
          <stop offset="60%" style="stop-color:#000000;stop-opacity:0" />
          <stop offset="100%" style="stop-color:#000000;stop-opacity:0.2" />
        </linearGradient>
        <!-- Drop shadow -->
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="2" dy="4" stdDeviation="4" flood-color="#000000" flood-opacity="0.4"/>
        </filter>
        <!-- Inner glow -->
        <filter id="innerGlow">
          <feGaussianBlur stdDeviation="2" result="blur"/>
          <feComposite in="SourceGraphic" in2="blur" operator="over"/>
        </filter>
      </defs>

      <!-- Badge circle with gold gradient -->
      <circle cx="${BADGE_SIZE/2}" cy="${BADGE_SIZE/2}" r="${BADGE_SIZE/2 - 8}"
        fill="url(#goldGradient)" filter="url(#shadow)"/>

      <!-- Inner ring for depth -->
      <circle cx="${BADGE_SIZE/2}" cy="${BADGE_SIZE/2}" r="${BADGE_SIZE/2 - 14}"
        fill="none" stroke="#8B6914" stroke-width="1.5" opacity="0.5"/>

      <!-- Glossy overlay -->
      <ellipse cx="${BADGE_SIZE/2}" cy="${BADGE_SIZE/2 - 15}" rx="${BADGE_SIZE/2 - 20}" ry="${BADGE_SIZE/3 - 10}"
        fill="url(#glossHighlight)"/>

      <!-- Quote mark -->
      <text x="${BADGE_SIZE/2}" y="${BADGE_SIZE/2 + 18}"
        font-family="Georgia, serif"
        font-size="70"
        font-weight="bold"
        fill="#5C4A1F"
        text-anchor="middle"
        dominant-baseline="middle">"</text>

      <!-- Quote mark highlight -->
      <text x="${BADGE_SIZE/2 - 1}" y="${BADGE_SIZE/2 + 16}"
        font-family="Georgia, serif"
        font-size="70"
        font-weight="bold"
        fill="#FFF8DC"
        opacity="0.4"
        text-anchor="middle"
        dominant-baseline="middle">"</text>
    </svg>
  `;
  return Buffer.from(svg);
}

async function addBadgeToImage(inputPath: string, outputPath: string): Promise<void> {
  const badgeSvg = createQuoteBadgeSVG();

  // Convert SVG to PNG with transparency
  const badgePng = await sharp(badgeSvg)
    .png()
    .toBuffer();

  // Get image dimensions
  const metadata = await sharp(inputPath).metadata();
  const width = metadata.width || 1024;
  const height = metadata.height || 1024;

  // Position badge in bottom-right corner
  const left = width - BADGE_SIZE - BADGE_MARGIN;
  const top = height - BADGE_SIZE - BADGE_MARGIN;

  // Composite the badge onto the image
  await sharp(inputPath)
    .composite([
      {
        input: badgePng,
        left: left,
        top: top,
      }
    ])
    .toFile(outputPath);

  console.log(`Badge added to: ${outputPath}`);
}

async function main() {
  const images = [
    'assets/image-1767782582.jpeg',
    'assets/image-1767782589.jpeg',
    'assets/image-1767782586.jpeg'
  ];

  for (const imagePath of images) {
    const inputPath = path.join(process.cwd(), imagePath);
    // Overwrite the original file
    const tempPath = inputPath.replace('.jpeg', '-temp.jpeg');

    await addBadgeToImage(inputPath, tempPath);

    // Replace original with new file
    const fs = await import('fs/promises');
    await fs.rename(tempPath, inputPath);

    console.log(`Updated: ${imagePath}`);
  }

  console.log('All images updated with gold quote badges!');
}

main().catch(console.error);
