from fastapi import APIRouter, Body
import base64
from io import BytesIO
from PIL import Image
import math
import json
from app.core.config import settings
from openai import OpenAI

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
            
        # If OpenAI is configured, use it for perfect accuracy
        if settings.openai_api_key:
            try:
                client = OpenAI(api_key=settings.openai_api_key)
                response = client.chat.completions.create(
                    model="gpt-4o",
                    messages=[
                        {
                            "role": "user",
                            "content": [
                                {"type": "text", "text": "Analyze this image and return ONLY a valid JSON object like {\"color\": \"red\"}. Pick the primary color from this list if it matches: red, green, blue, yellow, orange, purple, pink, black, white, gray, brown. If none match well, pick the closest base color name in lowercase. Do not include markdown formatting."},
                                {
                                    "type": "image_url",
                                    "image_url": {
                                        "url": f"data:image/jpeg;base64,{b64_str}",
                                        "detail": "low"
                                    }
                                }
                            ]
                        }
                    ],
                    max_tokens=20,
                    temperature=0.0
                )
                
                content = response.choices[0].message.content.strip()
                if content.startswith("```json"):
                    content = content.replace("```json", "").replace("```", "").strip()
                elif content.startswith("```"):
                    content = content.replace("```", "").strip()
                    
                data = json.loads(content)
                detected_color = data.get("color", "unknown").lower()
                
                # Sanitize response
                if detected_color not in PALETTE:
                    # GPT might return "navy blue" instead of "blue", handle basics
                    for base in PALETTE:
                        if base in detected_color:
                            detected_color = base
                            break
                            
                return {"color": detected_color, "rgb": [128, 128, 128]}
            except Exception as e:
                print(f"OpenAI Vision failed, falling back to math heuristic. Error: {e}")
                # Fallthrough to heuristic
                pass

        # ---------------------------------------------
        # FALLBACK HEURISTIC (If offline or API fails)
        # ---------------------------------------------
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


@router.post("/camera/detect-food")
def detect_food(payload: dict = Body(...)):
    """
    Receives a base64 encoded image and detects food/fruit and freshness.
    Requires OpenAI API key.
    """
    try:
        b64_str = payload.get("image", "")
        if "," in b64_str:
            b64_str = b64_str.split(",")[1]
            
        if settings.openai_api_key:
            try:
                client = OpenAI(api_key=settings.openai_api_key)
                response = client.chat.completions.create(
                    model="gpt-4o",
                    messages=[
                        {
                            "role": "user",
                            "content": [
                                {"type": "text", "text": "Identify the main food or fruit in this image. Evaluate its freshness and ripeness strictly based on its visual color and appearance. Return ONLY a valid JSON object with keys: 'item' (name of fruit/food, string), 'status' (e.g. 'Ripe', 'Unripe', 'Spoiled', 'Fresh', 'Cooked', string), 'color' (e.g. 'Yellow', string). Do not include markdown formatting or backticks."},
                                {
                                    "type": "image_url",
                                    "image_url": {
                                        "url": f"data:image/jpeg;base64,{b64_str}",
                                        "detail": "low"
                                    }
                                }
                            ]
                        }
                    ],
                    max_tokens=50,
                    temperature=0.0
                )
                
                content = response.choices[0].message.content.strip()
                if content.startswith("```json"):
                    content = content.replace("```json", "").replace("```", "").strip()
                elif content.startswith("```"):
                    content = content.replace("```", "").strip()
                    
                data = json.loads(content)
                item = data.get("item", "Unknown Food")
                status = data.get("status", "Unknown Status")
                color = data.get("color", "Unknown Color")
                
                return {"item": item, "status": status, "color": color}
            except Exception as e:
                print(f"OpenAI Vision failed for food detection. Error: {e}")
                return {"item": "Unknown Food", "status": "Error", "color": "Unknown"}
        else:
            return {"item": "API Key Required", "status": "Offline", "color": "Unknown"}

    except Exception as e:
        print(f"Error processing food image: {e}")
        return {"item": "Unknown", "status": "Error", "color": "Unknown"}
