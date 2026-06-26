"""
CIE Lab <-> sRGB conversion.

We generate test stimuli in Lab space (see test_stimuli.py) because it's
perceptually uniform, then convert to sRGB hex here for anything that needs
to be rendered or sent to the frontend. Implemented directly (no extra
dependency) since it's a well-defined, small piece of math and keeps the
backend's core scoring path dependency-light.
"""

from __future__ import annotations

from app.core.test_stimuli import LabColor

# D65 reference white, 2-degree observer
_REF_X, _REF_Y, _REF_Z = 95.047, 100.000, 108.883


def lab_to_xyz(lab: LabColor) -> tuple[float, float, float]:
    fy = (lab.L + 16.0) / 116.0
    fx = fy + (lab.a / 500.0)
    fz = fy - (lab.b / 200.0)

    def inv(t: float) -> float:
        return t ** 3 if t ** 3 > 0.008856 else (t - 16.0 / 116.0) / 7.787

    x = inv(fx) * _REF_X
    y = inv(fy) * _REF_Y
    z = inv(fz) * _REF_Z
    return x, y, z


def xyz_to_srgb(x: float, y: float, z: float) -> tuple[int, int, int]:
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


def lab_to_hex(lab: LabColor) -> str:
    x, y, z = lab_to_xyz(lab)
    r, g, b = xyz_to_srgb(x, y, z)
    return f"#{r:02x}{g:02x}{b:02x}"


def srgb_to_xyz(r: int, g: int, b: int) -> tuple[float, float, float]:
    def inv_gamma(c: float) -> float:
        c = c / 255.0
        return ((c + 0.055) / 1.055) ** 2.4 if c > 0.04045 else c / 12.92

    rl, gl, bl = inv_gamma(r), inv_gamma(g), inv_gamma(b)

    x = (rl * 0.4124 + gl * 0.3576 + bl * 0.1805) * 100
    y = (rl * 0.2126 + gl * 0.7152 + bl * 0.0722) * 100
    z = (rl * 0.0193 + gl * 0.1192 + bl * 0.9505) * 100
    return x, y, z


def xyz_to_lab(x: float, y: float, z: float) -> LabColor:
    def f(t: float) -> float:
        return t ** (1 / 3) if t > 0.008856 else (7.787 * t) + (16.0 / 116.0)

    fx, fy, fz = f(x / _REF_X), f(y / _REF_Y), f(z / _REF_Z)
    L = max(0.0, 116.0 * fy - 16.0)
    a = (fx - fy) * 500.0
    b = (fy - fz) * 200.0
    return LabColor(L=L, a=a, b=b)


def hex_to_lab(hex_color: str) -> LabColor:
    hex_color = hex_color.lstrip("#")
    r, g, b = int(hex_color[0:2], 16), int(hex_color[2:4], 16), int(hex_color[4:6], 16)
    x, y, z = srgb_to_xyz(r, g, b)
    return xyz_to_lab(x, y, z)
