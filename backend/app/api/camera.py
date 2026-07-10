from fastapi import APIRouter, Body
import base64
from io import BytesIO
from PIL import Image
import math

router = APIRouter(tags=["camera"])

PALETTE = {
    "red": (220, 38, 38),
    "green": (16, 185, 129),
    "blue": (37, 99, 235),
    "yellow": (245, 158, 11),
    "orange": (249, 115, 22),
    "purple": (147, 51, 234),
    "pink": (236, 72, 153),
    "black": (20, 20, 20),
    "white": (240, 240, 240),
    "gray": (156, 163, 175),
    "brown": (139, 69, 19)
}

def closest_color(r, g, b):
    min_dist = float('inf')
    best_color = "unknown"
    for name, (pr, pg, pb) in PALETTE.items():
        dist = math.sqrt((r - pr)**2 + (g - pg)**2 + (b - pb)**2)
        if dist < min_dist:
            min_dist = dist
            best_color = name
    return best_color

@router.post("/camera/detect-color")
def detect_color(payload: dict = Body(...)):
    """
    Receives a base64 encoded image from the mobile app camera.
    Crops the center 10x10 pixels and returns the dominant color category.
    """
    try:
        b64_str = payload.get("image", "")
        # Remove data URI prefix if present
        if "," in b64_str:
            b64_str = b64_str.split(",")[1]
            
        img_data = base64.b64decode(b64_str)
        image = Image.open(BytesIO(img_data)).convert('RGB')
        
        # Get center crop
        width, height = image.size
        left = (width - 10) / 2
        top = (height - 10) / 2
        right = (width + 10) / 2
        bottom = (height + 10) / 2
        center_crop = image.crop((left, top, right, bottom))
        
        # Calculate average color
        r_total, g_total, b_total = 0, 0, 0
        pixels = center_crop.getdata()
        for r, g, b in pixels:
            r_total += r
            g_total += g
            b_total += b
        count = len(pixels)
        avg_r = r_total / count
        avg_g = g_total / count
        avg_b = b_total / count

        # Use euclidean distance to find the closest color
        color_detected = closest_color(avg_r, avg_g, avg_b)
            
        return {"color": color_detected, "rgb": [avg_r, avg_g, avg_b]}
    except Exception as e:
        print(f"Error processing image: {e}")
        return {"color": "unknown", "rgb": [0,0,0]}
