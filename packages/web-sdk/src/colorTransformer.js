export const ColorTransformer = {
  rgbToHex: function(rgbStr) {
    const match = rgbStr.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    if (!match) return rgbStr; 
    return "#" + ((1 << 24) + (parseInt(match[1]) << 16) + (parseInt(match[2]) << 8) + parseInt(match[3])).toString(16).slice(1).toLowerCase();
  },

  transform: function(colorStr, profile) {
    if (!colorStr || colorStr === 'rgba(0, 0, 0, 0)' || colorStr === 'transparent') return colorStr;
    let hex = colorStr.startsWith('rgb(') ? this.rgbToHex(colorStr) : colorStr.toLowerCase();
    
    if (profile.deficiency_type === 'red-green') {
      if (['#ff0000', '#e74c3c', '#f44336', 'red'].includes(hex)) return '#3498db'; 
      if (['#00ff00', '#2ecc40', '#4caf50', '#008000', 'green'].includes(hex)) return '#f39c12'; 
    } else if (profile.deficiency_type === 'blue-yellow') {
      if (['#0000ff', '#3498db', '#2196f3', 'blue'].includes(hex)) return '#e74c3c'; 
      if (['#ffff00', '#f1c40f', '#ffeb3b', 'yellow'].includes(hex)) return '#9b59b6';
    }
    return colorStr;
  }
};
