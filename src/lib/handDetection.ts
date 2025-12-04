/**
 * Hand Detection and Pattern Overlay System
 * Simplified version that works reliably
 */

export interface HandLandmarks {
  landmarks: { x: number; y: number }[];
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  } | null;
}

/**
 * Detect hand in image using simple color-based detection
 * Returns null boundingBox to apply pattern to entire image
 */
export async function detectHandBoundaries(imageData: ImageData): Promise<HandLandmarks> {
  const { data, width, height } = imageData;
  
  let minX = width, minY = height, maxX = 0, maxY = 0;
  let handPixels = 0;
  
  // Detect skin-tone pixels (simple heuristic)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      // Simple skin tone detection
      if (isSkinTone(r, g, b)) {
        handPixels++;
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }
  
  // If we found enough skin pixels, return bounding box
  if (handPixels > width * height * 0.03) { // At least 3% of image (more lenient)
    return {
      landmarks: [],
      boundingBox: {
        x: Math.max(0, minX - 20), // Add padding
        y: Math.max(0, minY - 20),
        width: Math.min(width, maxX - minX + 40),
        height: Math.min(height, maxY - minY + 40),
      },
    };
  }
  
  // If detection fails, apply to entire image
  return {
    landmarks: [],
    boundingBox: null, // null means apply to entire image
  };
}

/**
 * Simple skin tone detection
 */
function isSkinTone(r: number, g: number, b: number): boolean {
  // Skin tone ranges (simplified)
  return (
    r > 95 && g > 40 && b > 20 &&
    r > g && r > b &&
    Math.abs(r - g) > 15 &&
    r - b > 15
  );
}

/**
 * Generate henna pattern as SVG
 */
export function generateHennaPattern(
  width: number,
  height: number,
  style: string
): string {
  // Generate SVG pattern based on style
  const patterns = {
    arabic: generateArabicPattern(width, height),
    mandala: generateMandalaPattern(width, height),
    floral: generateFloralPattern(width, height),
    geometric: generateGeometricPattern(width, height),
  };
  
  // Default to floral if style not found
  const patternKey = style.toLowerCase().includes('arabic') ? 'arabic' :
                     style.toLowerCase().includes('mandala') ? 'mandala' :
                     style.toLowerCase().includes('geometric') ? 'geometric' : 'floral';
  
  return patterns[patternKey];
}

function generateArabicPattern(width: number, height: number): string {
  return `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="arabicPattern" x="0" y="0" width="120" height="120" patternUnits="userSpaceOnUse">
          <!-- Flowing vines -->
          <path d="M 20 60 Q 40 40 60 60 Q 80 80 100 60" fill="none" stroke="#6B3410" stroke-width="3" stroke-linecap="round"/>
          <path d="M 60 20 Q 40 40 60 60 Q 80 80 60 100" fill="none" stroke="#6B3410" stroke-width="3" stroke-linecap="round"/>
          <!-- Leaves -->
          <ellipse cx="40" cy="50" rx="8" ry="15" fill="none" stroke="#6B3410" stroke-width="2"/>
          <ellipse cx="80" cy="70" rx="8" ry="15" fill="none" stroke="#6B3410" stroke-width="2"/>
          <!-- Dots -->
          <circle cx="60" cy="60" r="4" fill="#6B3410"/>
          <circle cx="30" cy="70" r="3" fill="#6B3410"/>
          <circle cx="90" cy="50" r="3" fill="#6B3410"/>
        </pattern>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#arabicPattern)"/>
    </svg>
  `;
}

function generateMandalaPattern(width: number, height: number): string {
  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(width, height) / 2.5;
  
  return `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <g transform="translate(${cx}, ${cy})">
        <!-- Outer petals -->
        ${Array.from({ length: 12 }, (_, i) => {
          const angle = (i * 30 * Math.PI) / 180;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          return `<ellipse cx="${x}" cy="${y}" rx="15" ry="30" transform="rotate(${i * 30} ${x} ${y})" fill="none" stroke="#6B3410" stroke-width="2.5"/>`;
        }).join('')}
        <!-- Circles -->
        <circle cx="0" cy="0" r="${radius}" fill="none" stroke="#6B3410" stroke-width="3"/>
        <circle cx="0" cy="0" r="${radius * 0.7}" fill="none" stroke="#6B3410" stroke-width="2.5"/>
        <circle cx="0" cy="0" r="${radius * 0.4}" fill="none" stroke="#6B3410" stroke-width="2"/>
        <!-- Center flower -->
        ${Array.from({ length: 8 }, (_, i) => {
          const angle = (i * 45 * Math.PI) / 180;
          const x = Math.cos(angle) * (radius * 0.2);
          const y = Math.sin(angle) * (radius * 0.2);
          return `<circle cx="${x}" cy="${y}" r="8" fill="none" stroke="#6B3410" stroke-width="2"/>`;
        }).join('')}
        <circle cx="0" cy="0" r="10" fill="#6B3410"/>
      </g>
    </svg>
  `;
}

function generateFloralPattern(width: number, height: number): string {
  return `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="floralPattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
          <!-- Flower center -->
          <circle cx="50" cy="50" r="8" fill="#6B3410"/>
          <!-- Petals -->
          ${Array.from({ length: 6 }, (_, i) => {
            const angle = (i * 60 * Math.PI) / 180;
            const x = 50 + Math.cos(angle) * 20;
            const y = 50 + Math.sin(angle) * 20;
            return `<ellipse cx="${x}" cy="${y}" rx="8" ry="15" transform="rotate(${i * 60} ${x} ${y})" fill="none" stroke="#6B3410" stroke-width="2"/>`;
          }).join('')}
          <!-- Leaves -->
          <path d="M 30 70 Q 35 80 40 70" fill="none" stroke="#6B3410" stroke-width="2"/>
          <path d="M 70 30 Q 75 20 80 30" fill="none" stroke="#6B3410" stroke-width="2"/>
          <!-- Dots -->
          <circle cx="20" cy="20" r="2" fill="#6B3410"/>
          <circle cx="80" cy="80" r="2" fill="#6B3410"/>
        </pattern>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#floralPattern)"/>
    </svg>
  `;
}

function generateGeometricPattern(width: number, height: number): string {
  return `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="geometricPattern" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
          <!-- Diamond -->
          <path d="M 40 10 L 70 40 L 40 70 L 10 40 Z" fill="none" stroke="#6B3410" stroke-width="2.5"/>
          <!-- Inner square -->
          <rect x="25" y="25" width="30" height="30" fill="none" stroke="#6B3410" stroke-width="2"/>
          <!-- Center circle -->
          <circle cx="40" cy="40" r="10" fill="none" stroke="#6B3410" stroke-width="2"/>
          <!-- Corner dots -->
          <circle cx="40" cy="10" r="3" fill="#6B3410"/>
          <circle cx="70" cy="40" r="3" fill="#6B3410"/>
          <circle cx="40" cy="70" r="3" fill="#6B3410"/>
          <circle cx="10" cy="40" r="3" fill="#6B3410"/>
        </pattern>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#geometricPattern)"/>
    </svg>
  `;
}

/**
 * Overlay henna pattern on original hand image
 */
export async function overlayHennaPattern(
  originalImage: HTMLImageElement,
  pattern: string,
  handBounds: HandLandmarks
): Promise<string> {
  const canvas = document.createElement('canvas');
  canvas.width = originalImage.width;
  canvas.height = originalImage.height;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) throw new Error('Could not get canvas context');
  
  // Draw original image
  ctx.drawImage(originalImage, 0, 0);
  
  // Create pattern image from SVG
  const patternImg = await svgToImage(pattern);
  
  // Apply pattern with blending
  ctx.globalCompositeOperation = 'multiply';
  ctx.globalAlpha = 0.6; // Slightly more transparent for better blending
  
  if (handBounds.boundingBox) {
    // Apply to detected hand area
    const { x, y, width, height } = handBounds.boundingBox;
    ctx.drawImage(patternImg, x, y, width, height);
  } else {
    // Apply to entire image (centered)
    const patternWidth = canvas.width * 0.8;
    const patternHeight = canvas.height * 0.8;
    const x = (canvas.width - patternWidth) / 2;
    const y = (canvas.height - patternHeight) / 2;
    ctx.drawImage(patternImg, x, y, patternWidth, patternHeight);
  }
  
  // Reset composite operation
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 1.0;
  
  return canvas.toDataURL('image/png');
}

/**
 * Convert SVG string to Image
 */
function svgToImage(svgString: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = reject;
    img.src = url;
  });
}

/**
 * Load image from URL or base64
 */
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Get ImageData from image
 */
export function getImageData(img: HTMLImageElement): ImageData {
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) throw new Error('Could not get canvas context');
  
  ctx.drawImage(img, 0, 0);
  return ctx.getImageData(0, 0, canvas.width, canvas.height);
}

/**
 * Main function: Apply henna design to hand image
 */
export async function applyHennaDesign(
  imageUrl: string,
  styleName: string
): Promise<string> {
  console.log('🎨 Starting pattern overlay for style:', styleName);
  
  try {
    // Load original image
    console.log('📷 Loading image...');
    const img = await loadImage(imageUrl);
    console.log('✅ Image loaded:', img.width, 'x', img.height);
    
    // Get image data for hand detection
    console.log('🔍 Detecting hand boundaries...');
    const imageData = getImageData(img);
    
    // Detect hand boundaries
    const handBounds = await detectHandBoundaries(imageData);
    console.log('✅ Hand detection complete:', handBounds.boundingBox ? 'Found hand area' : 'Using full image');
    
    // Generate henna pattern
    console.log('🎨 Generating pattern...');
    const pattern = generateHennaPattern(img.width, img.height, styleName);
    console.log('✅ Pattern generated');
    
    // Overlay pattern on original image
    console.log('🖼️ Overlaying pattern...');
    const result = await overlayHennaPattern(img, pattern, handBounds);
    console.log('✅ Pattern overlay complete!');
    
    return result;
  } catch (error) {
    console.error('❌ Hand detection overlay failed:', error);
    throw new Error(`Pattern overlay failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
