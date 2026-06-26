/**
 * NeuroLens Personalized Color Transformer for Web Pages
 * Aligned with the user's specific diagnostic report recommendations.
 */

function rgbToHex(rgbStr) {
  const match = rgbStr.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
  if (!match) return rgbStr; 
  const r = parseInt(match[1]);
  const g = parseInt(match[2]);
  const b = parseInt(match[3]);
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toLowerCase();
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? `rgb(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)})` : hex;
}

window.NeuroLensColorTransformer = {
  transform: function(colorStr, profile) {
    if (!colorStr || colorStr === 'rgba(0, 0, 0, 0)' || colorStr === 'transparent' || colorStr === 'none') return colorStr;
    if (!profile) return colorStr;

    // Convert input color to simple hex/rgb for matching
    let hexCheck = colorStr.toLowerCase();
    if (colorStr.startsWith('rgb')) {
      hexCheck = rgbToHex(colorStr).toLowerCase();
    }

    // 1. Check custom recommended_transformations from user's active profile
    if (profile.recommended_transformations && profile.recommended_transformations.length > 0) {
      for (const t of profile.recommended_transformations) {
        if (t && t.from && hexCheck === t.from.toLowerCase()) {
          return t.to; // Apply exact personalized recommended color
        }
      }
    }

    // 2. Check meaning_based_transformations from user's active profile
    if (profile.meaning_based_transformations && profile.meaning_based_transformations.length > 0) {
      for (const m of profile.meaning_based_transformations) {
        if (m && m.original_color_name) {
          const nameLower = m.original_color_name.toLowerCase();
          if ((nameLower.includes("red") && ['#ff0000', '#e74c3c', '#f44336', 'red', '#c0392b'].includes(hexCheck)) ||
              (nameLower.includes("green") && ['#00ff00', '#2ecc40', '#4caf50', 'green', '#27ae60'].includes(hexCheck)) ||
              (nameLower.includes("brown") && ['#8b5e3c', '#a0522d', '#8b4513', 'brown'].includes(hexCheck))) {
            return m.transformed_color_hex || '#3498db';
          }
        }
      }
    }

    // 3. Fallback Heuristic Matching for generic website elements
    let r=0, g=0, b=0;
    if (colorStr.startsWith('rgb')) {
      const match = colorStr.match(/\d+/g);
      if (match && match.length >= 3) {
        r = parseInt(match[0]);
        g = parseInt(match[1]);
        b = parseInt(match[2]);
      }
    } else {
      let hex = colorStr.toLowerCase();
      if (hex === 'red') { r=255; g=0; b=0; }
      else if (hex === 'green') { r=0; g=255; b=0; }
      else if (hex === 'blue') { r=0; g=0; b=255; }
      else if (hex === 'yellow') { r=255; g=255; b=0; }
      else {
         const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
         if(m) { r = parseInt(m[1], 16); g = parseInt(m[2], 16); b = parseInt(m[3], 16); }
      }
    }

    const isRed = (r > 150 && g < 100 && b < 100) || (r > g * 1.5 && r > b * 1.5 && r > 100);
    const isGreen = (g > 150 && r < 120 && b < 120) || (g > r * 1.5 && g > b * 1.5 && g > 100);
    const isBlue = (b > 120 && r < 130 && g < 160) || (b > r * 1.2 && b > g * 1.1 && b > 90);
    const isYellow = (r > 150 && g > 150 && b < 100) || (r > 150 && g > 150 && Math.abs(r-g) < 50 && b < r*0.5);

    const defType = profile.deficiency_type || 'red-green';

    if (defType === 'red-green') {
      if (isRed) return '#3498db'; // Safe High-Contrast Blue
      if (isGreen) return '#f39c12'; // Safe Vibrant Amber
      if (isBlue) return '#4f46e5'; // Safe Deep Indigo (so user sees clear visual transformation on Blue buttons too!)
      if (['#8b5e3c', '#a0522d', '#8b4513', '#d2691e'].includes(hexCheck)) return '#9b59b6'; // Safe Purple
    } else if (defType === 'blue-yellow') {
      if (isBlue) return '#e74c3c'; // Safe High-Contrast Red
      if (isYellow) return '#9b59b6'; // Safe Deep Purple
    } else if (defType === 'monochromacy') {
      if (isRed) return '#404040';
      if (isGreen) return '#a0a0a0';
      if (isBlue) return '#d0d0d0';
      if (isYellow) return '#ffffff';
    }
    return colorStr;
  }
};
