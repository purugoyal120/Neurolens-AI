/**
 * CIE Lab <-> sRGB conversion, self-contained.
 *
 * JS port of engine/python/color.py — must implement IDENTICAL math so the
 * two language ports stay in parity (see engine/tests/test_parity.py and
 * docs/transformation-engine-spec.md section 4 for why this is duplicated
 * rather than shared).
 *
 * Works as a plain ES module (browser extension, dashboard SDK, React
 * Native's JS engine) with zero external dependencies.
 */

const REF_X = 95.047;
const REF_Y = 100.0;
const REF_Z = 108.883; // D65, 2-degree observer

/** @typedef {{ L: number, a: number, b: number }} Lab */

/**
 * @param {Lab} lab
 * @returns {number} hue angle in degrees, 0-360
 */
export function hueDeg(lab) {
  return (Math.atan2(lab.b, lab.a) * (180 / Math.PI) + 360) % 360;
}

/**
 * @param {Lab} lab
 * @returns {number} chroma (colorfulness magnitude)
 */
export function chroma(lab) {
  return Math.hypot(lab.a, lab.b);
}

/**
 * Returns a new Lab color with the same L/chroma but rotated to newHueDeg.
 * @param {Lab} lab
 * @param {number} newHueDeg
 * @returns {Lab}
 */
export function withHue(lab, newHueDeg) {
  const c = chroma(lab);
  const rad = (newHueDeg * Math.PI) / 180;
  return { L: lab.L, a: c * Math.cos(rad), b: c * Math.sin(rad) };
}

/**
 * @param {string} hexColor
 * @returns {Lab}
 */
export function hexToLab(hexColor) {
  const [r, g, b] = hexToRgb(hexColor);
  const [x, y, z] = srgbToXyz(r, g, b);
  return xyzToLab(x, y, z);
}

/**
 * @param {Lab} lab
 * @returns {string} hex color, e.g. "#e74c3c"
 */
export function labToHex(lab) {
  const [x, y, z] = labToXyz(lab);
  const [r, g, b] = xyzToSrgb(x, y, z);
  return `#${toHex2(r)}${toHex2(g)}${toHex2(b)}`;
}

function toHex2(n) {
  return n.toString(16).padStart(2, "0");
}

function hexToRgb(hexColor) {
  let h = hexColor.replace(/^#/, "");
  if (h.length === 3) {
    h = h
      .split("")
      .map((c) => c + c)
      .join("");
  }
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

function srgbToXyz(r, g, b) {
  const invGamma = (c) => {
    c = c / 255.0;
    return c > 0.04045 ? Math.pow((c + 0.055) / 1.055, 2.4) : c / 12.92;
  };
  const rl = invGamma(r);
  const gl = invGamma(g);
  const bl = invGamma(b);
  const x = (rl * 0.4124 + gl * 0.3576 + bl * 0.1805) * 100;
  const y = (rl * 0.2126 + gl * 0.7152 + bl * 0.0722) * 100;
  const z = (rl * 0.0193 + gl * 0.1192 + bl * 0.9505) * 100;
  return [x, y, z];
}

function xyzToLab(x, y, z) {
  const f = (t) => (t > 0.008856 ? Math.pow(t, 1 / 3) : 7.787 * t + 16.0 / 116.0);
  const fx = f(x / REF_X);
  const fy = f(y / REF_Y);
  const fz = f(z / REF_Z);
  const L = Math.max(0.0, 116.0 * fy - 16.0);
  const a = (fx - fy) * 500.0;
  const b = (fy - fz) * 200.0;
  return { L, a, b };
}

function labToXyz(lab) {
  const fy = (lab.L + 16.0) / 116.0;
  const fx = fy + lab.a / 500.0;
  const fz = fy - lab.b / 200.0;
  const inv = (t) => (Math.pow(t, 3) > 0.008856 ? Math.pow(t, 3) : (t - 16.0 / 116.0) / 7.787);
  return [inv(fx) * REF_X, inv(fy) * REF_Y, inv(fz) * REF_Z];
}

function xyzToSrgb(x, y, z) {
  x /= 100.0;
  y /= 100.0;
  z /= 100.0;
  const r = x * 3.2406 + y * -1.5372 + z * -0.4986;
  const g = x * -0.9689 + y * 1.8758 + z * 0.0415;
  const b = x * 0.0557 + y * -0.204 + z * 1.057;
  const gamma = (c) => {
    c = Math.max(0.0, Math.min(1.0, c));
    return c > 0.0031308 ? 1.055 * Math.pow(c, 1 / 2.4) - 0.055 : 12.92 * c;
  };
  const clampByte = (c) => Math.round(Math.max(0.0, Math.min(1.0, gamma(c))) * 255);
  return [clampByte(r), clampByte(g), clampByte(b)];
}
