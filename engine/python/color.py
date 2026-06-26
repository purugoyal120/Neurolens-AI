"""
CIE Lab <-> sRGB conversion, self-contained.

Deliberately duplicated from backend/app/core/color_space.py rather than
imported from it. The Transformation Engine package needs to be droppable
into a browser extension build, an Excel add-in build, or any other context
with zero dependency on the rest of this monorepo's backend — see
docs/transformation-engine-spec.md section 4 ("why the JS port exists").
This file is the Python half of that self-containment; engine/js/color.js
is the JS half implementing the identical math.
"""

from __future__ import annotations

import math
from dataclasses import dataclass

_REF_X, _REF_Y, _REF_Z = 95.047, 100.000, 108.883  # D65, 2-degree observer


@dataclass(frozen=True)
class Lab:
    L: float
    a: float
    b: float

    def hue_deg(self) -> float:
        return (math.degrees(math.atan2(self.b, self.a)) + 360) % 360

    def chroma(self) -> float:
        return math.hypot(self.a, self.b)

    def with_hue(self, new_hue_deg: float) -> "Lab":
        """Returns a new Lab color with the same L/chroma but rotated to new_hue_deg."""
        c = self.chroma()
        rad = math.radians(new_hue_deg)
        return Lab(L=self.L, a=c * math.cos(rad), b=c * math.sin(rad))


def hex_to_lab(hex_color: str) -> Lab:
    r, g, b = _hex_to_rgb(hex_color)
    x, y, z = _srgb_to_xyz(r, g, b)
    return _xyz_to_lab(x, y, z)


def lab_to_hex(lab: Lab) -> str:
    x, y, z = _lab_to_xyz(lab)
    r, g, b = _xyz_to_srgb(x, y, z)
    return f"#{r:02x}{g:02x}{b:02x}"


def _hex_to_rgb(hex_color: str) -> tuple[int, int, int]:
    h = hex_color.lstrip("#")
    if len(h) == 3:  # shorthand #abc -> #aabbcc
        h = "".join(c * 2 for c in h)
    return int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)


def _srgb_to_xyz(r: int, g: int, b: int) -> tuple[float, float, float]:
    def inv_gamma(c: float) -> float:
        c = c / 255.0
        return ((c + 0.055) / 1.055) ** 2.4 if c > 0.04045 else c / 12.92

    rl, gl, bl = inv_gamma(r), inv_gamma(g), inv_gamma(b)
    x = (rl * 0.4124 + gl * 0.3576 + bl * 0.1805) * 100
    y = (rl * 0.2126 + gl * 0.7152 + bl * 0.0722) * 100
    z = (rl * 0.0193 + gl * 0.1192 + bl * 0.9505) * 100
    return x, y, z


def _xyz_to_lab(x: float, y: float, z: float) -> Lab:
    def f(t: float) -> float:
        return t ** (1 / 3) if t > 0.008856 else (7.787 * t) + (16.0 / 116.0)

    fx, fy, fz = f(x / _REF_X), f(y / _REF_Y), f(z / _REF_Z)
    L = max(0.0, 116.0 * fy - 16.0)
    a = (fx - fy) * 500.0
    b = (fy - fz) * 200.0
    return Lab(L=L, a=a, b=b)


def _lab_to_xyz(lab: Lab) -> tuple[float, float, float]:
    fy = (lab.L + 16.0) / 116.0
    fx = fy + (lab.a / 500.0)
    fz = fy - (lab.b / 200.0)

    def inv(t: float) -> float:
        return t ** 3 if t ** 3 > 0.008856 else (t - 16.0 / 116.0) / 7.787

    return inv(fx) * _REF_X, inv(fy) * _REF_Y, inv(fz) * _REF_Z


def _xyz_to_srgb(x: float, y: float, z: float) -> tuple[int, int, int]:
    x, y, z = x / 100.0, y / 100.0, z / 100.0
    r = x * 3.2406 + y * -1.5372 + z * -0.4986
    g = x * -0.9689 + y * 1.8758 + z * 0.0415
    b = x * 0.0557 + y * -0.2040 + z * 1.0570

    def gamma(c: float) -> float:
        c = max(0.0, min(1.0, c))
        return 1.055 * (c ** (1 / 2.4)) - 0.055 if c > 0.0031308 else 12.92 * c

    return (
        round(max(0.0, min(1.0, gamma(r))) * 255),
        round(max(0.0, min(1.0, gamma(g))) * 255),
        round(max(0.0, min(1.0, gamma(b))) * 255),
    )
