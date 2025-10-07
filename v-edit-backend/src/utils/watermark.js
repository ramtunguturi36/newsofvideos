import sharp from 'sharp';

export async function addWatermark(imageBuffer, watermarkText = 'PREVIEW ONLY') {
  try {
    // Get image metadata
    const metadata = await sharp(imageBuffer).metadata();
    const { width, height } = metadata;

    // Calculate watermark size based on image size
    const fontSize = Math.max(24, Math.min(width, height) / 20);
    const padding = Math.max(10, Math.min(width, height) / 50);

    // Create watermark SVG
    const watermarkSvg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="2" dy="2" stdDeviation="3" flood-color="black" flood-opacity="0.5"/>
          </filter>
        </defs>
        <text 
          x="50%" 
          y="50%" 
          text-anchor="middle" 
          dominant-baseline="middle"
          font-family="Arial, sans-serif"
          font-size="${fontSize}"
          font-weight="bold"
          fill="rgba(255, 255, 255, 0.8)"
          stroke="rgba(0, 0, 0, 0.8)"
          stroke-width="2"
          filter="url(#shadow)"
        >
          ${watermarkText}
        </text>
        <text 
          x="50%" 
          y="50%" 
          text-anchor="middle" 
          dominant-baseline="middle"
          dy="${fontSize + padding}"
          font-family="Arial, sans-serif"
          font-size="${fontSize * 0.6}"
          font-weight="bold"
          fill="rgba(255, 255, 255, 0.6)"
          stroke="rgba(0, 0, 0, 0.6)"
          stroke-width="1"
          filter="url(#shadow)"
        >
          DO NOT COPY
        </text>
      </svg>
    `;

    // Apply watermark to image
    const watermarkedImage = await sharp(imageBuffer)
      .composite([
        {
          input: Buffer.from(watermarkSvg),
          top: 0,
          left: 0,
        }
      ])
      .jpeg({ quality: 85 }) // Reduce quality for preview
      .toBuffer();

    return watermarkedImage;
  } catch (error) {
    console.error('Error adding watermark:', error);
    // Return original image if watermarking fails
    return imageBuffer;
  }
}

export async function addDiagonalWatermark(imageBuffer, watermarkText = 'PREVIEW') {
  try {
    const metadata = await sharp(imageBuffer).metadata();
    const { width, height } = metadata;

    // Calculate watermark properties
    const fontSize = Math.max(20, Math.min(width, height) / 25);
    const spacing = fontSize * 2;
    const angle = -45; // Diagonal angle

    // Create multiple watermarks across the image
    const watermarks = [];
    for (let x = -width; x < width * 2; x += spacing) {
      for (let y = -height; y < height * 2; y += spacing) {
        watermarks.push({
          input: Buffer.from(`
            <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
              <text 
                x="${x}" 
                y="${y}" 
                font-family="Arial, sans-serif"
                font-size="${fontSize}"
                font-weight="bold"
                fill="rgba(255, 255, 255, 0.1)"
                stroke="rgba(0, 0, 0, 0.1)"
                stroke-width="1"
                transform="rotate(${angle} ${x} ${y})"
              >
                ${watermarkText}
              </text>
            </svg>
          `),
          top: 0,
          left: 0,
        });
      }
    }

    // Apply watermarks to image
    const watermarkedImage = await sharp(imageBuffer)
      .composite(watermarks)
      .jpeg({ quality: 80 }) // Reduce quality for preview
      .toBuffer();

    return watermarkedImage;
  } catch (error) {
    console.error('Error adding diagonal watermark:', error);
    return imageBuffer;
  }
}
