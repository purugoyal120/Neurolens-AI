/**
 * NeuroLens Personalized Color Transformer for Web Pages
 * "Hum isko na colour pe dependent nhi bnna chate hum isko us meaning colour per dependent rakhna chate hai"
 * Aligned strictly with the user's specific diagnostic report recommendations.
 */

function rgbToHex(rgbStr) {
  const match = rgbStr.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)$/);
  if (!match) return rgbStr; 
  const alpha = match[4];
  if (alpha !== undefined && parseFloat(alpha) === 0) return rgbStr; // Fully transparent
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

    // Extract RGB values to check color category
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

    // Don't transform dark backgrounds/text or light backgrounds/text
    if ((r < 40 && g < 40 && b < 40) || (r > 240 && g > 240 && b > 240)) {
      return colorStr;
    }

    // Precise color classification heuristics
    const isRed = (r > 120 && g < r * 0.75 && b < r * 0.75);
    const isGreen = (g > 110 && r < g * 0.85 && b < g * 0.85);
    const isBlue = (b > 110 && r < b * 0.85 && g < b * 0.85);
    const isYellow = (r > 150 && g > 130 && b < r * 0.6 && Math.abs(r - g) < 70);
    const isBrown = (r > 100 && r < 180 && g > 50 && g < 130 && b < 100 && r > g * 1.2);

    // 2. STRICTLY FOLLOW THE REPORT (profile.meaning_based_transformations)
    // If the report specifies problematic colors (e.g. Red, Green, Brown), ONLY transform those!
    if (profile.meaning_based_transformations && profile.meaning_based_transformations.length > 0) {
      for (const m of profile.meaning_based_transformations) {
        if (m && m.original_color_name) {
          const nameLower = m.original_color_name.toLowerCase();
          const targetHex = m.transformed_color_hex || '#3498db';

          if (nameLower.includes("red") && isRed) return targetHex;
          if (nameLower.includes("green") && isGreen) return targetHex;
          if (nameLower.includes("brown") && isBrown) return targetHex;
          if (nameLower.includes("blue") && isBlue) return targetHex;
          if (nameLower.includes("yellow") && isYellow) return targetHex;
        }
      }
      // CRITICAL: If the color on the website (like the 3.4 yellow rating badge or blue view link)
      // was NOT listed as a problematic color in the user's report, DO NOT CHANGE IT!
      return colorStr; 
    }

    // 3. Absolute Fallback only if no meaning_based_transformations exist in report
    const defStr = (profile.deficiency_type || profile.deficiency_name || profile.clinical_diagnosis || 'red-green').toLowerCase();
    const isBlueYellowDef = defStr.includes('blue') || defStr.includes('yellow') || defStr.includes('tritan');
    const isMonoDef = defStr.includes('mono') || defStr.includes('achromat');
    const isRedGreenDef = !isBlueYellowDef && !isMonoDef;

    if (isRedGreenDef) {
      if (isRed) return '#3498db'; // Safe High-Contrast Blue
      if (isGreen) return '#f39c12'; // Safe Vibrant Amber
      if (isBrown) return '#9b59b6'; // Safe Purple
      // Notice we DO NOT touch yellow or blue!
    } else if (isBlueYellowDef) {
      if (isBlue) return '#e74c3c'; // Safe High-Contrast Red
      if (isYellow) return '#9b59b6'; // Safe Deep Purple
    } else if (isMonoDef) {
      if (isRed) return '#404040';
      if (isGreen) return '#a0a0a0';
      if (isBlue) return '#d0d0d0';
      if (isYellow) return '#ffffff';
    }
    return colorStr;
  }
};
