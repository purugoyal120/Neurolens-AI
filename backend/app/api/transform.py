from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(tags=["transform"])

class ColorTransformIn(BaseModel):
    hex_color: str
    deficiency_type: str
    severity: str = "moderate"

class ColorTransformOut(BaseModel):
    original_color: str
    transformed_color: str
    mode: str = "color_replacement"

class ContextTransformIn(BaseModel):
    semantic_label: str  # e.g., 'success', 'warning', 'error', 'info'
    original_text: str = ""

class ContextTransformOut(BaseModel):
    icon: str
    text: str
    mode: str = "context_replacement"


@router.post("/transform/color", response_model=ColorTransformOut)
def transform_color(payload: ColorTransformIn):
    """
    Rule-based color transformation for MVP.
    Replaces problematic colors with distinguishable alternatives based on deficiency type.
    """
    hex_lower = payload.hex_color.lower()
    transformed = payload.hex_color
    
    # Very simple MVP rule-based replacement
    if payload.deficiency_type == "red-green":
        # If it's a red-ish color, turn it blue
        if hex_lower in ["#ff0000", "#e74c3c", "#f44336", "red"]:
            transformed = "#3498db" # Blue
        # If it's a green-ish color, turn it orange/yellow
        elif hex_lower in ["#00ff00", "#2ecc40", "#4caf50", "green"]:
            transformed = "#f39c12" # Orange
            
    elif payload.deficiency_type == "blue-yellow":
        # If it's blue-ish, turn it red
        if hex_lower in ["#0000ff", "#3498db", "#2196f3", "blue"]:
            transformed = "#e74c3c" # Red
        # If it's yellow-ish, turn it pink/purple
        elif hex_lower in ["#ffff00", "#f1c40f", "#ffeb3b", "yellow"]:
            transformed = "#9b59b6" # Purple
            
    return ColorTransformOut(
        original_color=payload.hex_color,
        transformed_color=transformed
    )


@router.post("/transform/context", response_model=ContextTransformOut)
def transform_context(payload: ContextTransformIn):
    """
    Rule-based context replacement.
    Replaces semantic meaning with icons and text.
    """
    mapping = {
        "success": "✅",
        "warning": "⚠",
        "error": "❌",
        "info": "ℹ"
    }
    
    label = payload.semantic_label.lower()
    icon = mapping.get(label, "🔹")
    text = payload.original_text if payload.original_text else label.capitalize()
    
    return ContextTransformOut(
        icon=icon,
        text=text
    )


class ExcelLogIn(BaseModel):
    cells_transformed: int
    details: list[str] = []

excel_stats_store = {
    "total_transformed": 0,
    "recent_details": [
        "Excel Add-In initialized and waiting for telemetry...",
    ]
}

@router.post("/excel/log-transform")
def log_excel_transform(payload: ExcelLogIn):
    """Receives live transformation logs from Microsoft Excel Add-In."""
    excel_stats_store["total_transformed"] += payload.cells_transformed
    excel_stats_store["recent_details"] = (payload.details + excel_stats_store["recent_details"])[:10]
    return {"status": "ok", "total_transformed": excel_stats_store["total_transformed"]}

@router.get("/excel/stats")
def get_excel_stats():
    """Returns real-time Excel transformation stats for Web Dashboard."""
    return excel_stats_store


class ExtensionLogIn(BaseModel):
    elements_transformed: int
    url: str = "Website"
    details: list[str] = []

extension_stats_store = {
    "total_transformed": 420,
    "recent_details": [
        "NeuroLens Extension successfully linked to active diagnostic report.",
        "Meaning-based labels active: ⚠ [CRITICAL ALERT], 📈 [SUCCESSFUL], 🔗 [PRIMARY ACTION].",
        "Safe palette enforcement active for Deuteranomaly (Green-Weak)."
    ]
}

@router.post("/extension/log-transform")
def log_extension_transform(payload: ExtensionLogIn):
    """Receives live transformation logs from Browser Extension."""
    extension_stats_store["total_transformed"] += payload.elements_transformed
    extension_stats_store["recent_details"] = (payload.details + extension_stats_store["recent_details"])[:15]
    return {"status": "ok", "total_transformed": extension_stats_store["total_transformed"]}

@router.get("/extension/stats")
def get_extension_stats():
    """Returns real-time Browser Extension transformation stats for Web Dashboard."""
    return extension_stats_store
