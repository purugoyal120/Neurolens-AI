"""
Vision Profile Analysis Algorithm — rule-based with AI enhancements.

Public entry point: `analyze_vision_profile(user_answers)`.

Approach:
1. Look up each answer against QUESTIONS to find the stimulus category and
   the category the user actually picked.
2. Run every wrong answer through `classify_confusion` to tag it as red-green
   evidence, blue-yellow evidence, or neither.
3. Whichever axis has more tagged misses wins as `deficiency_type`;
   severity is the error rate on that axis specifically.
4. `perception_scores` per primary color (red/green/blue/yellow/brown).
5. `meaning_based_transformations`: Emphasizes the core NeuroLens philosophy —
   never depend on color alone! Strictly filters transformation cards so that
   ONLY the exact colors mentioned in `color_confusion_status` are transformed.
"""

from __future__ import annotations

from dataclasses import dataclass

from app.core.vision_test_data import QUESTIONS, Question, classify_confusion

_QUESTIONS_BY_ID: dict[str, Question] = {q.id: q for q in QUESTIONS}

RED_GREEN_SUBSTITUTIONS: dict[str, str] = {
    "red": "#3498DB",     # red -> blue
    "green": "#F39C12",   # green -> orange/amber
    "brown": "#9B59B6",   # brown -> purple
    "orange": "#3498DB",
}

BLUE_YELLOW_SUBSTITUTIONS: dict[str, str] = {
    "blue": "#E74C3C",     # blue -> red
    "yellow": "#8E44AD",   # yellow -> purple
    "purple": "#F1C40F",
    "gray": "#34495E",
}

SEVERITY_THRESHOLDS: list[tuple[float, str]] = [
    (0.0, "none"),
    (0.20, "mild"),
    (0.45, "moderate"),
    (0.70, "severe"),
]

PRIMARY_CATEGORIES = ("red", "green", "blue", "yellow", "brown")


@dataclass
class ScoredAnswer:
    question: Question
    chosen_option_id: str
    chosen_category: str
    is_correct: bool
    confusion_axis: str | None


def _score_answers(user_answers: list[dict]) -> list[ScoredAnswer]:
    scored: list[ScoredAnswer] = []
    for ans in user_answers:
        question = _QUESTIONS_BY_ID.get(ans["question_id"])
        if question is None:
            continue

        chosen_option = next((o for o in question.options if o.id == ans["selected_option_id"]), None)
        if chosen_option is None:
            continue

        is_correct = chosen_option.id == question.correct_option_id
        confusion_axis = None if is_correct else classify_confusion(
            question.stimulus_category, chosen_option.category
        )

        scored.append(ScoredAnswer(
            question=question,
            chosen_option_id=chosen_option.id,
            chosen_category=chosen_option.category,
            is_correct=is_correct,
            confusion_axis=confusion_axis,
        ))
    return scored


def _severity_for_error_rate(error_rate: float) -> str:
    label = "none"
    for threshold, candidate in SEVERITY_THRESHOLDS:
        if error_rate >= threshold:
            label = candidate
        else:
            break
    return label


def _determine_deficiency(scored: list[ScoredAnswer], perception_scores: dict[str, float]) -> dict:
    correct_count = sum(1 for s in scored if s.is_correct)
    total = len(scored)
    acc = round((correct_count / total) * 100) if total > 0 else 0
    overall_error_rate = (total - correct_count) / total if total > 0 else 1.0

    rg_misses = sum(1 for s in scored if s.confusion_axis == "red_green")
    by_misses = sum(1 for s in scored if s.confusion_axis == "blue_yellow")
    
    rg_questions = [s for s in scored if s.question.axis.value in ("red_green", "mixed", "real_world")]
    by_questions = [s for s in scored if s.question.axis.value in ("blue_yellow", "mixed", "real_world")]

    # Calculate accurate severity based on overall error rate to prevent 0% accuracy from showing 'moderate'
    if acc == 100:
        severity = "none"
    elif acc >= 76:
        severity = "mild"
    elif acc >= 40:
        severity = "moderate"
    else:
        severity = "severe"

    # Dynamically build meaning_based_transformations directly from the exact questions the user got wrong!
    dynamic_transformations = []
    seen_categories = set()
    
    for s in scored:
        if not s.is_correct:
            cat = s.question.stimulus_category
            if cat not in seen_categories:
                seen_categories.add(cat)
                hex_val = s.question.stimulus_hex
                chose = s.chosen_category
                
                if cat == "red":
                    dynamic_transformations.append({
                        "original_color_name": f"🔴 Problematic Red ({hex_val})",
                        "transformed_color_hex": "#3498DB",
                        "meaning_label": "Critical Alert / Over Budget [High-Contrast Blue + ⚠]",
                        "explanation": f"During the test, you mistook this red shade for {chose}. Because red merges with other tones for you, we transform it to High-Contrast Blue and explicitly append '[Critical Alert]' so you never rely on color alone."
                    })
                elif cat == "green":
                    dynamic_transformations.append({
                        "original_color_name": f"🟢 Problematic Green ({hex_val})",
                        "transformed_color_hex": "#F39C12",
                        "meaning_label": "Successful / On Track [Vibrant Amber + 📈]",
                        "explanation": f"You confused this green indicator with {chose}. To prevent costly mistakes on dashboards, we shift it to Vibrant Amber and append '[Successful]' so your charts are instantly clear."
                    })
                elif cat == "blue":
                    dynamic_transformations.append({
                        "original_color_name": f"🔵 Confusing Blue ({hex_val})",
                        "transformed_color_hex": "#E74C3C",
                        "meaning_label": "Primary Action / Active Link [Accessible Red + 🔗]",
                        "explanation": f"This blue tone was mistaken for {chose} in your test responses. We transform it to Accessible Red with a clear meaning label so you can navigate web links without hesitation."
                    })
                elif cat == "yellow":
                    dynamic_transformations.append({
                        "original_color_name": f"🟡 Low-Contrast Yellow ({hex_val})",
                        "transformed_color_hex": "#8E44AD",
                        "meaning_label": "Warning / Needs Review [Deep Purple + ⚠]",
                        "explanation": f"You perceived this yellow patch as {chose}. Because yellow warning banners wash out for you, we shift them to Deep Purple with an explicit '[Warning]' tag."
                    })
                elif cat == "brown":
                    dynamic_transformations.append({
                        "original_color_name": f"🟤 Earthy Brown ({hex_val})",
                        "transformed_color_hex": "#9B59B6",
                        "meaning_label": "Secondary Metric / Baseline [Deep Purple + 📊]",
                        "explanation": f"This deep brown shade was confused with {chose}. We shift it to Deep Purple with a direct meaning tag so every dashboard metric stands out independently."
                    })
                elif cat == "orange":
                    dynamic_transformations.append({
                        "original_color_name": f"🟠 Problematic Warm Orange ({hex_val})",
                        "transformed_color_hex": "#3498DB",
                        "meaning_label": "Active Highlight / Priority [High-Contrast Blue + ✴]",
                        "explanation": f"You mistook this warm orange shade for {chose}. We transform it into High-Contrast Blue with a clear priority tag so it never blends with red or brown."
                    })

    if not dynamic_transformations:
        if acc == 100 or total == 0:
            dynamic_transformations = [
                {
                    "original_color_name": "🟢 Normal Green Indicator (#27AE60)",
                    "transformed_color_hex": "#27AE60",
                    "meaning_label": "Healthy / Passing [Maintained]",
                    "explanation": "You see green perfectly, so we keep the natural color while ensuring the meaning 'Healthy / Passing' is clearly labeled."
                },
                {
                    "original_color_name": "🔴 Normal Red Alert (#C0392B)",
                    "transformed_color_hex": "#C0392B",
                    "meaning_label": "Critical Alert / Budget Overrun [Maintained]",
                    "explanation": "You distinguish red without hesitation, so we preserve the natural alert color while keeping the explicit meaning label active."
                }
            ]
        else:
            dynamic_transformations = [
                {
                    "original_color_name": "🔴 Problematic Red (#E74C3C)",
                    "transformed_color_hex": "#3498DB",
                    "meaning_label": "Critical Alert / Over Budget [High-Contrast Blue + ⚠]",
                    "explanation": "Because red appears muddy or merges with dark backgrounds for you, we transform it to High-Contrast Blue and explicitly append the meaning '[Critical Alert]' so you never rely on color alone."
                },
                {
                    "original_color_name": "🟢 Problematic Green (#2ECC40)",
                    "transformed_color_hex": "#F39C12",
                    "meaning_label": "Successful / On Track [Vibrant Amber + 📈]",
                    "explanation": "Green easily blends with earthy browns in your vision profile. We shift it to Vibrant Amber and append the explicit meaning '[Successful]' so you can review charts instantly."
                }
            ]

    if acc == 100 or total == 0:
        deficiency_type = "None (Normal Vision)"
        deficiency_name = "Normal Color Vision (No Deficiency)"
        color_confusion_status = "Flawless Color Discrimination (No Overlap Detected)"
        ai_explanation = "Your vision test showed flawless color discrimination across all tested spectrums. Because you distinguish red, green, blue, and yellow perfectly, NeuroLens preserves your natural screen view. However, our system remains ready to inject semantic meaning labels if you ever encounter poorly contrasted charts."
    elif acc == 0:
        deficiency_type = "Complete Color Vision Deficiency"
        deficiency_name = "Achromatopsia / Combined Protan-Deutan-Tritan Deficiency"
        color_confusion_status = "Severe Color Confusion Across All Spectrums (Red, Green, Blue, Yellow)"
        ai_explanation = "Your test results show a 0% accuracy score, indicating severe color confusion across all primary spectrums (red, green, blue, and yellow). In traditional tests, this gets incorrectly categorized as just 'moderate red-green deficiency' because of rule-based point counting. NeuroLens recognizes this as a complete spectrum overlap. Our core philosophy is that you should NEVER depend on color alone. We dynamically transform all problematic colors into high-contrast shades and attach clear meaning tags (like [Critical Alert], [Successful], or [Warning]) so you can navigate every digital tool with 100% confidence."
    elif rg_misses >= by_misses:
        deficiency_type = "Red-Green Deficiency"
        red_score = perception_scores.get("red", 1.0)
        green_score = perception_scores.get("green", 1.0)
        
        if red_score < green_score:
            deficiency_type = "Protanomaly (Red-Weak Deficiency)"
            deficiency_name = "Protanomaly (Red-Weak Deficiency)"
            color_confusion_status = "Strong Red & Dark Brown Overlap Detected"
        elif green_score < red_score:
            deficiency_type = "Deuteranomaly (Green-Weak Deficiency)"
            deficiency_name = "Deuteranomaly (Green-Weak Deficiency)"
            color_confusion_status = "Strong Green & Earthy Brown Overlap Detected"
        else:
            deficiency_type = "Combined Red-Green Deficiency"
            deficiency_name = "Protan / Deutan Combined (Red-Green Deficiency)"
            color_confusion_status = "Significant Red-Green & Brown Confusion Detected"
            
        ai_explanation = f"Based on your test responses, we found that you often confuse red, green, and brown shades, especially when they appear as small indicator dots or chart lines. Our core philosophy is that you should NEVER have to depend on color alone to do your work. To solve this, NeuroLens dynamically transforms problematic reds and greens into highly distinguishable shades (like High-Contrast Blue and Vibrant Amber) AND immediately attaches a clear meaning label (such as [Critical Alert] or [Successful]) right next to them. This ensures you can effortlessly understand your spreadsheets and dashboards without any guesswork."
    else:
        deficiency_type = "Tritanomaly (Blue-Yellow Deficiency)"
        deficiency_name = "Tritanomaly (Blue-Yellow Deficiency)"
        color_confusion_status = "Distinct Blue-Yellow & Purple Overlap Detected"
        ai_explanation = "During your test, we noticed that blue and yellow shades tend to wash out or merge with purple backgrounds. Because we refuse to make you dependent on color alone, NeuroLens actively transforms low-contrast blues and yellows into rich, prominent hues AND injects explicit meaning labels (like [Warning: High CPU] or [Action Required]) right beside them. This ensures warning banners and status lights on your daily tools are instantly understandable."

    risk_areas = [
        "Business Analytics Dashboards (interpreting growth vs loss)",
        "Spreadsheet status lights (distinguishing red vs green dots)",
        "Financial Trading Charts (buying vs selling indicators)",
        "Cloud Server Monitoring (spotting offline gateway warnings)",
        "Everyday Web Navigation & Color-Coded Forms"
    ]
    
    personal_impact = {
        "workplace": "You will never have to guess whether a status dot is red or green during team presentations again.",
        "productivity": "Saves hours of double-checking confusing spreadsheet colors or asking colleagues for confirmation.",
        "dashboard": "Instantly translates confusing colored lights into clear words and familiar shapes like 📈 and ⚠.",
        "daily": "Gives you complete confidence while checking your bank account, navigating web forms, or reading charts."
    }

    fallback_data = {
        "deficiency_type": deficiency_type,
        "deficiency_name": deficiency_name,
        "severity": severity,
        "color_confusion_status": color_confusion_status,
        "ai_explanation": ai_explanation,
        "meaning_based_transformations": dynamic_transformations,
        "risk_areas": risk_areas,
        "personal_impact": personal_impact
    }

    try:
        from openai import OpenAI
        import json
        import os
        
        client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY", "YOUR_OPENAI_API_KEY_HERE"))
        
        test_data = []
        for s in scored:
            test_data.append({
                "stimulus": s.question.stimulus_category,
                "user_chose": s.chosen_category,
                "is_correct": s.is_correct,
                "confusion_axis": s.confusion_axis
            })
            
        prompt = f"""
        You are the advanced NeuroLens AI Personalized Perception Engine. Analyze these vision test results:
        {json.dumps(test_data, indent=2)}
        User Accuracy: {acc}% ({correct_count} correct out of {total}).
        
        CRITICAL PHILOSOPHY: Do NOT treat this as a normal color blindness detector. NeuroLens AI is a Personalized Perception Platform. The goal is to understand how each individual perceives colors and adapt digital interfaces accordingly ("Beyond Color. Beyond Barriers.").
        
        CRITICAL RULE 1: We do NOT want users to be dependent on color alone! When a color is transformed, right next to it, the system must append/display its exact meaning/label (e.g. Red -> High-Contrast Blue + [Critical Alert / Error]).
        CRITICAL RULE 2: Explain all AI insights in simple, everyday human language—no technical jargon.
        CRITICAL RULE 3: Strict Severity & Classification Alignment:
        - If User Accuracy is 0% or below 40% (error rate >= 60%), the severity MUST be classified as 'severe'. NEVER classify 0% accuracy as 'moderate' or 'mild'.
        - If User Accuracy is between 40% and 75%, severity MUST be 'moderate'.
        - If User Accuracy is between 76% and 99%, severity MUST be 'mild'.
        - If User Accuracy is 100%, severity MUST be 'none', deficiency_type MUST be 'None (Normal Vision)', and deficiency_name MUST be 'Normal Color Vision (No Deficiency)'.
        - If User Accuracy is 0%, deficiency_type MUST be 'Complete Color Vision Deficiency' and deficiency_name MUST be 'Achromatopsia / Combined Protan-Deutan-Tritan Deficiency'.
        - Otherwise, dynamically determine the exact, true deficiency_type (e.g., 'Deuteranomaly (Green-Weak)', 'Protanomaly (Red-Weak)', 'Tritanomaly (Blue-Yellow)', 'Combined Red-Green & Blue-Yellow', etc.) based on the exact questions missed! DO NOT restrict it to just 'red-green' or 'blue-yellow'.
        
        Determine the exact deficiency_type (e.g. 'Deuteranomaly (Green-Weak)', 'Protanomaly (Red-Weak)', 'Tritanomaly (Blue-Yellow)', 'Complete Color Vision Deficiency', or 'None (Normal Vision)').
        Determine the exact deficiency_name (e.g. 'Deuteranomaly', 'Protanomaly', 'Tritanomaly', 'Achromatopsia', or 'Normal Color Vision').
        Determine the severity (must be exactly 'none', 'mild', 'moderate', or 'severe').
        Determine color_confusion_status (e.g. 'Strong Red & Dark Brown Overlap Detected', 'Distinct Blue-Yellow & Purple Overlap Detected', 'Severe Color Confusion Across All Spectrums (Red, Green, Blue, Yellow)', etc.).
        
        Determine the following rich personalized fields in simple everyday language:
        - ai_explanation: Warm, human explanation of what was found in the test AND exactly how our project transforms things for them using meaning-based labels.
        - risk_areas: Array of everyday tasks.
        - personal_impact: Object with keys 'workplace', 'productivity', 'dashboard', 'daily'.
        
        Respond ONLY with a valid JSON object matching these exact keys.
        """
        
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": prompt}],
            response_format={ "type": "json_object" },
            temperature=0.1
        )
        
        result = json.loads(response.choices[0].message.content)
        print("OPENAI ANALYSIS SUCCESS:", result)
        
        for k, v in fallback_data.items():
            if k not in result or not result[k]:
                result[k] = v
                
        # Guarantee severity matches accuracy rules perfectly
        result["severity"] = severity
        if acc == 0:
            result["deficiency_type"] = "Complete Color Vision Deficiency"
            result["deficiency_name"] = "Achromatopsia / Combined Protan-Deutan-Tritan Deficiency"
            result["color_confusion_status"] = "Severe Color Confusion Across All Spectrums (Red, Green, Blue, Yellow)"
            
    except Exception as e:
        print("OPENAI FAILED, USING LOCAL FALLBACK:", e)
        result = fallback_data

    # --- STRICT INTELLIGENT FILTER: Transform ONLY the exact colors mentioned in color_confusion_status! ---
    status_text = result.get("color_confusion_status", "").lower()
    
    master_cards = {
        "red": {
            "original_color_name": "🔴 Problematic Red (#E74C3C)",
            "transformed_color_hex": "#3498DB",
            "meaning_label": "Critical Alert / Over Budget [High-Contrast Blue + ⚠]",
            "explanation": "Because red appears muddy or merges with dark backgrounds in your specific color confusion profile, we transform it to High-Contrast Blue and explicitly append '[Critical Alert]' so you never rely on color alone."
        },
        "green": {
            "original_color_name": "🟢 Problematic Green (#2ECC40)",
            "transformed_color_hex": "#F39C12",
            "meaning_label": "Successful / On Track [Vibrant Amber + 📈]",
            "explanation": "Green easily blends with earthy browns or dark tones in your vision profile. We shift it to Vibrant Amber and append the explicit meaning '[Successful]' so you can review charts instantly."
        },
        "blue": {
            "original_color_name": "🔵 Confusing Blue (#3498DB)",
            "transformed_color_hex": "#E74C3C",
            "meaning_label": "Primary Action / Active Link [Accessible Red + 🔗]",
            "explanation": "Blue washes out or merges with dark backgrounds for you. We transform it to Accessible Red with an explicit link symbol so you can navigate web applications effortlessly."
        },
        "yellow": {
            "original_color_name": "🟡 Washed-out Yellow (#F1C40F)",
            "transformed_color_hex": "#8E44AD",
            "meaning_label": "Warning / Needs Review [Deep Purple + ⚠]",
            "explanation": "Yellow warning banners appear faded to your eyes. We shift them to Deep Purple and append the explicit meaning '[Warning: Needs Review]' so they capture your attention instantly."
        },
        "brown": {
            "original_color_name": "🟤 Earthy Brown (#8B5E3C)",
            "transformed_color_hex": "#9B59B6",
            "meaning_label": "Secondary Metric / Baseline [Deep Purple + 📊]",
            "explanation": "To prevent brown from being mistaken for dark green or red, we shift it to Deep Purple with a direct meaning tag so every metric stands out independently."
        },
        "purple": {
            "original_color_name": "🟣 Confusing Purple (#8E44AD)",
            "transformed_color_hex": "#F1C40F",
            "meaning_label": "Highlight / Active Selection [Vibrant Yellow + ✴]",
            "explanation": "Purple overlaps with blue tones in your vision profile. We shift it to Vibrant Yellow with a clear selection tag so it stands out perfectly."
        },
        "orange": {
            "original_color_name": "🟠 Problematic Warm Orange (#D35400)",
            "transformed_color_hex": "#3498DB",
            "meaning_label": "Active Highlight / Priority [High-Contrast Blue + ✴]",
            "explanation": "You have difficulty distinguishing warm orange shades. We transform it into High-Contrast Blue with a clear priority tag so it never blends with red or brown."
        }
    }

    if acc == 100 or total == 0:
        result["meaning_based_transformations"] = [
            {
                "original_color_name": "🟢 Normal Green Indicator (#27AE60)",
                "transformed_color_hex": "#27AE60",
                "meaning_label": "Healthy / Passing [Maintained]",
                "explanation": "You see green perfectly, so we keep the natural color while ensuring the meaning 'Healthy / Passing' is clearly labeled."
            },
            {
                "original_color_name": "🔴 Normal Red Alert (#C0392B)",
                "transformed_color_hex": "#C0392B",
                "meaning_label": "Critical Alert / Budget Overrun [Maintained]",
                "explanation": "You distinguish red without hesitation, so we preserve the natural alert color while keeping the explicit meaning label active."
            }
        ]
    else:
        matched_cards = []
        for color_key, card_data in master_cards.items():
            if color_key in status_text:
                matched_cards.append(card_data)
        
        if not matched_cards:
            matched_cards = dynamic_transformations
            
        result["meaning_based_transformations"] = matched_cards

    return result


def _compute_perception_scores(scored: list[ScoredAnswer]) -> dict[str, float]:
    scores: dict[str, float] = {}
    for category in PRIMARY_CATEGORIES:
        relevant = [
            s for s in scored
            if s.question.stimulus_category == category
            or any(o.category == category for o in s.question.options)
        ]
        if not relevant:
            scores[category] = 1.0
            continue
        stimulus_matches = [s for s in relevant if s.question.stimulus_category == category]
        if stimulus_matches:
            correct = sum(1 for s in stimulus_matches if s.is_correct)
            scores[category] = round(correct / len(stimulus_matches), 3)
        else:
            lured = sum(1 for s in relevant if (not s.is_correct) and s.chosen_category == category)
            scores[category] = round(1.0 - (lured / len(relevant)), 3)
    return scores


def analyze_vision_profile(user_id: str, user_answers: list[dict]) -> dict:
    scored = _score_answers(user_answers)
    perception_scores = _compute_perception_scores(scored)

    ai_data = _determine_deficiency(scored, perception_scores)
    deficiency_type = ai_data.get("deficiency_type", "None (Normal Vision)")
    deficiency_name = ai_data.get("deficiency_name", "Normal Color Vision")
    severity = ai_data.get("severity", "none")
    color_confusion_status = ai_data.get("color_confusion_status", "Flawless Color Discrimination")

    correct_count = sum(1 for s in scored if s.is_correct)
    total = len(scored)
    percent_accuracy = round((correct_count / total) * 100) if total > 0 else 0

    return {
        "user_id": user_id,
        "deficiency_type": deficiency_type,
        "deficiency_name": deficiency_name,
        "clinical_diagnosis": deficiency_name,
        "severity": severity,
        "percent_accuracy": percent_accuracy,
        "color_confusion_status": color_confusion_status,
        "perception_scores": perception_scores,
        "ai_explanation": ai_data.get("ai_explanation"),
        "meaning_based_transformations": ai_data.get("meaning_based_transformations"),
        "risk_areas": ai_data.get("risk_areas"),
        "personal_impact": ai_data.get("personal_impact"),
        "_score_summary": {
            "total_questions": total,
            "correct_count": correct_count,
            "accuracy": round(correct_count / total, 3) if total else 0.0,
        },
    }
