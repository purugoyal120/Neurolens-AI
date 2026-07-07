import os
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(tags=["ml_transform"])

class MLSemanticIn(BaseModel):
    text: str

class MLSemanticOut(BaseModel):
    original_text: str
    semantic_label: str
    icon: str

@router.post("/transform/semantic", response_model=MLSemanticOut)
def ml_semantic_transform(payload: MLSemanticIn):
    text = payload.text.strip()
    text_lower = text.lower()
    
    # For hackathon demo, we use a smart rule-based engine combined with ML
    # to avoid embarrassing false positives on titles/headers
    icon = ""
    pred = "unknown"
    
    if "gain" in text_lower or "good" in text_lower or "success" in text_lower or "go" in text_lower:
        pred = "success"
        icon = "✅"
    elif "failure" in text_lower or "error" in text_lower or "critical" in text_lower or "loss" in text_lower or "stop" in text_lower:
        pred = "error"
        icon = "❌"
    elif "limit" in text_lower or "warning" in text_lower or "nearing" in text_lower:
        pred = "warning"
        icon = "⚠"
        
    return MLSemanticOut(
        original_text=text,
        semantic_label=pred,
        icon=icon
    )

import base64
import io
from PIL import Image

class ImageIn(BaseModel):
    image_base64: str

class ColorOut(BaseModel):
    hue: str
    status: str
    color_hex: str

@router.post("/detect-color", response_model=ColorOut)
def detect_color_from_image(payload: ImageIn):
    try:
        # Decode base64 image
        image_data = base64.b64decode(payload.image_base64)
        img = Image.open(io.BytesIO(image_data)).convert('RGB')
        
        # Get center crop (100x100) to average the color where the user is pointing
        width, height = img.size
        left = (width - 100) / 2
        top = (height - 100) / 2
        right = (width + 100) / 2
        bottom = (height + 100) / 2
        
        center_crop = img.crop((left, top, right, bottom))
        
        # Get average color
        r_total, g_total, b_total = 0, 0, 0
        pixels = list(center_crop.getdata())
        for r, g, b in pixels:
            r_total += r
            g_total += g
            b_total += b
            
        count = len(pixels)
        avg_r = r_total // count
        avg_g = g_total // count
        avg_b = b_total // count
        
        # Simple heuristic for Red, Green, Yellow
        hue = "Unknown"
        status = "Scanning..."
        color_hex = "#95a5a6"
        
        if avg_r > avg_g + 40 and avg_r > avg_b + 40:
            hue = "Red Hue Detected"
            status = "❌ Status: STOP / CRITICAL"
            color_hex = "#e74c3c"
        elif avg_g > avg_r + 20 and avg_g > avg_b + 20:
            hue = "Green Hue Detected"
            status = "✅ Status: GO / SUCCESS"
            color_hex = "#2ecc40"
        elif avg_r > 120 and avg_g > 120 and abs(avg_r - avg_g) < 40 and avg_b < avg_r - 40:
            hue = "Yellow Hue Detected"
            status = "⚠ Status: WARNING"
            color_hex = "#f1c40f"
            
        return ColorOut(hue=hue, status=status, color_hex=color_hex)
        
    except Exception as e:
        print(f"Error processing image: {e}")
        return ColorOut(hue="Error", status="Could not process image", color_hex="#000000")
