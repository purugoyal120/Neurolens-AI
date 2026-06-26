from fastapi import APIRouter, Body
import base64
from io import BytesIO
from PIL import Image

router = APIRouter(tags=["camera"])

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

        # Extremely simple heuristics for hackathon demo
        color_detected = "unknown"
        if avg_r > 150 and avg_g < 100 and avg_b < 100:
            color_detected = "red"
        elif avg_g > 120 and avg_r < 100 and avg_b < 100:
            color_detected = "green"
        elif avg_b > 120 and avg_r < 100 and avg_g < 150:
            color_detected = "blue"
        elif avg_r > 150 and avg_g > 150 and avg_b < 100:
            color_detected = "yellow"
            
        return {"color": color_detected, "rgb": [avg_r, avg_g, avg_b]}
    except Exception as e:
        print(f"Error processing image: {e}")
        return {"color": "unknown", "rgb": [0,0,0]}
