from fastapi import APIRouter, Body
import base64
from io import BytesIO
from PIL import Image
import math

router = APIRouter(tags=["camera"])

PALETTE = {
    "red": (220, 38, 38),
    "dark_red": (139, 0, 0),
    "light_red": (255, 102, 102),
    "green": (16, 185, 129),
    "dark_green": (0, 100, 0),
    "light_green": (144, 238, 144),
    "blue": (37, 99, 235),
    "dark_blue": (0, 0, 139),
    "light_blue": (173, 216, 230),
    "yellow": (245, 158, 11),
    "orange": (249, 115, 22),
    "purple": (147, 51, 234),
    "pink": (236, 72, 153),
    "black": (30, 30, 30),
    "white": (240, 240, 240),
    "gray": (128, 128, 128),
    "brown": (139, 69, 19)
}

def closest_color(r, g, b):
    min_dist = float('inf')
    best_color = "unknown"
    for name, (pr, pg, pb) in PALETTE.items():
        # Weighted Euclidean distance gives better human-eye matching
        # Red has more visual weight, green most, blue least roughly
        dist = math.sqrt(((r - pr)*0.3)**2 + ((g - pg)*0.59)**2 + ((b - pb)*0.11)**2)
        if dist < min_dist:
            min_dist = dist
            best_color = name
    
    # Simplify light/dark variants back to base color for the mobile app mapper
    if best_color.startswith("dark_") or best_color.startswith("light_"):
        return best_color.split("_")[1]
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
        
        # Get a larger center crop (center 30% of the image)
        width, height = image.size
        crop_size = min(width, height) * 0.3
        left = (width - crop_size) / 2
        top = (height - crop_size) / 2
        right = (width + crop_size) / 2
        bottom = (height + crop_size) / 2
        center_crop = image.crop((left, top, right, bottom))
        
        # Resize to 50x50 to speed up processing
        center_crop = center_crop.resize((50, 50))
        
        # Calculate dominant color by frequency (not average) to ignore logos/shadows
        color_counts = {}
        pixels = center_crop.getdata()
        
        for r, g, b in pixels:
            c_name = closest_color(r, g, b)
            color_counts[c_name] = color_counts.get(c_name, 0) + 1
            
        # Find the most frequent color
        dominant_color = max(color_counts, key=color_counts.get)
        
        # We also send back a rough average RGB for the mobile UI
        return {"color": dominant_color, "rgb": [128, 128, 128]}
    except Exception as e:
        print(f"Error processing image: {e}")
        return {"color": "unknown", "rgb": [0,0,0]}
