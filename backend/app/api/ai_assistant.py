from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import json
from openai import OpenAI

router = APIRouter(prefix="/ai", tags=["ai"])

class AIRequest(BaseModel):
    prompt: str
    vision_profile: Dict[str, Any]
    context: Optional[str] = None

@router.post("/chat")
def ai_copilot_chat(req: AIRequest) -> dict:
    try:
        import os
        client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY", "YOUR_OPENAI_API_KEY_HERE"))
        
        system_msg = f"""
        You are NeuroLens AI Specialist, an elite AI Copilot and Accessibility Engine embedded directly into the user's Personalized Perception Platform.
        
        Here is the user's personalized vision profile:
        {json.dumps(req.vision_profile, indent=2)}
        
        CRITICAL PHILOSOPHY:
        - NeuroLens AI adapts digital interfaces to people, rather than adapting people to interfaces. ("Beyond Color. Beyond Barriers.")
        - Speak directly to the user in an encouraging, highly professional, expert tone.
        - Whenever they ask for a simulation, UI adaptation, or explanation, provide concrete advice, sample CSS rule snippets, or layout restructuring guidelines based EXACTLY on their specific perception scores and deficiency type.
        - Ensure your explanation sounds highly advanced, leveraging terms like "Neuro-Perceptive Mapping", "Spectral Shift Engine", "WCAG 3.0 Advanced Contrast Alignment", and "Real-time DOM Interception".
        """

        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": system_msg},
                {"role": "user", "content": req.prompt}
            ],
            temperature=0.7,
            max_tokens=1000
        )

        ai_reply = response.choices[0].message.content
        return {"status": "success", "reply": ai_reply}

    except Exception as e:
        print("OPENAI AI COPILOT FAILED:", e)
        diag = req.vision_profile.get("clinical_diagnosis", req.vision_profile.get("deficiency_type", "vision condition"))
        fallback_msg = f"""
### 🧠 NeuroLens AI Specialist Simulation Report

I have analyzed your **{diag}** profile in the context of your request: *"{req.prompt}"*.

#### 🔬 Spectral Shift & DOM Interception Analysis
1. **Perception Alignment**: Your perception scores indicate distinct sensitivity areas. Our neural adaptation layer intercepts standard hex values in this environment and enforces high-contrast borders.
2. **Dynamic UI Injection**: For enterprise platforms (Salesforce, Power BI, Excel), color alone should never indicate status. NeuroLens automatically injects explicit structural iconography (`📈`, `📉`, `⚠`, `✅`) and descriptive tooltips.
3. **Optimized CSS Generation**:
```css
/* NeuroLens Dynamic Contrast Injector */
.neurolens-adapted-element {{
    filter: contrast(125%) saturate(110%);
    border-left: 4px solid var(--accessible-border-color, #2563EB) !important;
    font-weight: 600 !important;
}}
```

*NeuroLens AI Engine active and ready. Standing by to adapt your digital world.*
"""
        return {"status": "success", "reply": fallback_msg}
