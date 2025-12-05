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
  // Scale factor for responsive design
  const scale = Math.min(width, height) / 400;
  const sw = 3 * scale; // stroke width
  
  return `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">
      <!-- Main flowing vine from wrist to fingers -->
      <path d="M ${width/2} ${height*0.9} Q ${width*0.3} ${height*0.7} ${width*0.4} ${height*0.5} Q ${width*0.5} ${height*0.3} ${width*0.3} ${height*0.1}" 
            fill="none" stroke="#6B3410" stroke-width="${sw}" stroke-linecap="round"/>
      <path d="M ${width/2} ${height*0.9} Q ${width*0.7} ${height*0.7} ${width*0.6} ${height*0.5} Q ${width*0.5} ${height*0.3} ${width*0.7} ${height*0.1}" 
            fill="none" stroke="#6B3410" stroke-width="${sw}" stroke-linecap="round"/>
      
      <!-- Decorative leaves along vines -->
      <ellipse cx="${width*0.35}" cy="${height*0.6}" rx="${8*scale}" ry="${15*scale}" transform="rotate(-30 ${width*0.35} ${height*0.6})" fill="none" stroke="#6B3410" stroke-width="${sw*0.7}"/>
      <ellipse cx="${width*0.65}" cy="${height*0.6}" rx="${8*scale}" ry="${15*scale}" transform="rotate(30 ${width*0.65} ${height*0.6})" fill="none" stroke="#6B3410" stroke-width="${sw*0.7}"/>
      <ellipse cx="${width*0.45}" cy="${height*0.4}" rx="${8*scale}" ry="${15*scale}" transform="rotate(-45 ${width*0.45} ${height*0.4})" fill="none" stroke="#6B3410" stroke-width="${sw*0.7}"/>
      <ellipse cx="${width*0.55}" cy="${height*0.4}" rx="${8*scale}" ry="${15*scale}" transform="rotate(45 ${width*0.55} ${height*0.4})" fill="none" stroke="#6B3410" stroke-width="${sw*0.7}"/>
      
      <!-- Decorative dots -->
      <circle cx="${width*0.5}" cy="${height*0.8}" r="${4*scale}" fill="#6B3410"/>
      <circle cx="${width*0.4}" cy="${height*0.7}" r="${3*scale}" fill="#6B3410"/>
      <circle cx="${width*0.6}" cy="${height*0.7}" r="${3*scale}" fill="#6B3410"/>
      <circle cx="${width*0.35}" cy="${height*0.5}" r="${3*scale}" fill="#6B3410"/>
      <circle cx="${width*0.65}" cy="${height*0.5}" r="${3*scale}" fill="#6B3410"/>
      <circle cx="${width*0.5}" cy="${height*0.3}" r="${3*scale}" fill="#6B3410"/>
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
  const scale = Math.min(width, height) / 400;
  const sw = 2.5 * scale;
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) * 0.15;
  
  return `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">
      <!-- Central flower -->
      <circle cx="${centerX}" cy="${centerY}" r="${10*scale}" fill="#6B3410"/>
      ${Array.from({ length: 8 }, (_, i) => {
        const angle = (i * 45 * Math.PI) / 180;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        return `<ellipse cx="${x}" cy="${y}" rx="${10*scale}" ry="${20*scale}" transform="rotate(${i * 45} ${x} ${y})" fill="none" stroke="#6B3410" stroke-width="${sw}"/>`;
      }).join('')}
      
      <!-- Surrounding flowers -->
      ${Array.from({ length: 4 }, (_, i) => {
        const angle = (i * 90 * Math.PI) / 180;
        const x = centerX + Math.cos(angle) * radius * 2.5;
        const y = centerY + Math.sin(angle) * radius * 2.5;
        return `
          <circle cx="${x}" cy="${y}" r="${6*scale}" fill="#6B3410"/>
          ${Array.from({ length: 6 }, (_, j) => {
            const petalAngle = (j * 60 * Math.PI) / 180;
            const px = x + Math.cos(petalAngle) * radius * 0.5;
            const py = y + Math.sin(petalAngle) * radius * 0.5;
            return `<ellipse cx="${px}" cy="${py}" rx="${6*scale}" ry="${12*scale}" transform="rotate(${j * 60} ${px} ${py})" fill="none" stroke="#6B3410" stroke-width="${sw*0.8}"/>`;
          }).join('')}
        `;
      }).join('')}
      
      <!-- Decorative vines connecting flowers -->
      <path d="M ${centerX} ${centerY-radius*2.5} Q ${centerX+radius} ${centerY-radius*1.5} ${centerX+radius*2.5} ${centerY}" 
            fill="none" stroke="#6B3410" stroke-width="${sw*0.6}" stroke-linecap="round"/>
      <path d="M ${centerX+radius*2.5} ${centerY} Q ${centerX+radius*1.5} ${centerY+radius} ${centerX} ${centerY+radius*2.5}" 
            fill="none" stroke="#6B3410" stroke-width="${sw*0.6}" stroke-linecap="round"/>
      
      <!-- Decorative dots -->
      ${Array.from({ length: 12 }, (_, i) => {
        const angle = (i * 30 * Math.PI) / 180;
        const x = centerX + Math.cos(angle) * radius * 1.8;
        const y = centerY + Math.sin(angle) * radius * 1.8;
        return `<circle cx="${x}" cy="${y}" r="${2.5*scale}" fill="#6B3410"/>`;
      }).join('')}
    </svg>
  `;
}

function generateGeometricPattern(width: number, height: number): string {
  const scale = Math.min(width, height) / 400;
  const sw = 2.5 * scale;
  const centerX = width / 2;
  const centerY = height / 2;
  const size = Math.min(width, height) * 0.35;
  
  return `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">
      <!-- Outer diamond -->
      <path d="M ${centerX} ${centerY-size} L ${centerX+size} ${centerY} L ${centerX} ${centerY+size} L ${centerX-size} ${centerY} Z" 
            fill="none" stroke="#6B3410" stroke-width="${sw}"/>
      
      <!-- Inner diamond -->
      <path d="M ${centerX} ${centerY-size*0.7} L ${centerX+size*0.7} ${centerY} L ${centerX} ${centerY+size*0.7} L ${centerX-size*0.7} ${centerY} Z" 
            fill="none" stroke="#6B3410" stroke-width="${sw*0.8}"/>
      
      <!-- Square -->
      <rect x="${centerX-size*0.4}" y="${centerY-size*0.4}" width="${size*0.8}" height="${size*0.8}" 
            fill="none" stroke="#6B3410" stroke-width="${sw*0.7}"/>
      
      <!-- Center circle -->
      <circle cx="${centerX}" cy="${centerY}" r="${size*0.2}" fill="none" stroke="#6B3410" stroke-width="${sw*0.7}"/>
      <circle cx="${centerX}" cy="${centerY}" r="${size*0.1}" fill="#6B3410"/>
      
      <!-- Corner decorations -->
      ${Array.from({ length: 4 }, (_, i) => {
        const angle = (i * 90 * Math.PI) / 180;
        const x = centerX + Math.cos(angle) * size;
        const y = centerY + Math.sin(angle) * size;
        return `
          <circle cx="${x}" cy="${y}" r="${4*scale}" fill="#6B3410"/>
          <circle cx="${x}" cy="${y}" r="${8*scale}" fill="none" stroke="#6B3410" stroke-width="${sw*0.5}"/>
        `;
      }).join('')}
      
      <!-- Diagonal corner elements -->
      ${Array.from({ length: 4 }, (_, i) => {
        const angle = (i * 90 + 45) * Math.PI / 180;
        const x = centerX + Math.cos(angle) * size * 0.7;
        const y = centerY + Math.sin(angle) * size * 0.7;
        return `<circle cx="${x}" cy="${y}" r="${3*scale}" fill="#6B3410"/>`;
      }).join('')}
      
      <!-- Connecting lines -->
      <line x1="${centerX-size*0.4}" y1="${centerY-size*0.4}" x2="${centerX-size*0.7}" y2="${centerY}" stroke="#6B3410" stroke-width="${sw*0.5}"/>
      <line x1="${centerX+size*0.4}" y1="${centerY-size*0.4}" x2="${centerX+size*0.7}" y2="${centerY}" stroke="#6B3410" stroke-width="${sw*0.5}"/>
      <line x1="${centerX+size*0.4}" y1="${centerY+size*0.4}" x2="${centerX+size*0.7}" y2="${centerY}" stroke="#6B3410" stroke-width="${sw*0.5}"/>
      <line x1="${centerX-size*0.4}" y1="${centerY+size*0.4}" x2="${centerX-size*0.7}" y2="${centerY}" stroke="#6B3410" stroke-width="${sw*0.5}"/>
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
  
  // Create a temporary canvas for the pattern
  const patternCanvas = document.createElement('canvas');
  patternCanvas.width = originalImage.width;
  patternCanvas.height = originalImage.height;
  
  // Convert SVG to image and draw on pattern canvas
  const patternImg = await svgToImage(pattern);
  const patternCtx = patternCanvas.getContext('2d');
  
  if (!patternCtx) throw new Error('Could not get pattern canvas context');
  
  // Draw pattern image at exact canvas size (no scaling, no repeating)
  patternCtx.drawImage(patternImg, 0, 0, patternCanvas.width, patternCanvas.height);
  
  // Apply pattern with blending
  ctx.globalCompositeOperation = 'multiply';
  ctx.globalAlpha = 0.7;
  
  if (handBounds.boundingBox) {
    // Apply to detected hand area
    const { x, y, width, height } = handBounds.boundingBox;
    ctx.drawImage(patternCanvas, x, y, width, height, x, y, width, height);
  } else {
    // Apply to entire image
    ctx.drawImage(patternCanvas, 0, 0);
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
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    console.log('🖼️ Converting SVG to image, blob size:', blob.size);
    
    img.onload = () => {
      console.log('✅ SVG converted to image:', img.width, 'x', img.height);
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = (err) => {
      console.error('❌ SVG to image conversion failed:', err);
      URL.revokeObjectURL(url);
      reject(err);
    };
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
    console.log('✅ Pattern generated, SVG length:', pattern.length);
    console.log('📄 SVG Preview (first 500 chars):', pattern.substring(0, 500));
    
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
