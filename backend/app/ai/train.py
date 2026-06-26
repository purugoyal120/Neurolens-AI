import json
import joblib
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import make_pipeline

# 1. Generate Synthetic Dataset
# Features: "text_content" 
# Labels: "success", "warning", "error", "info"

data = [
    # Success labels
    ("success", "success"),
    ("good", "success"),
    ("done", "success"),
    ("completed successfully", "success"),
    ("all systems operational", "success"),
    ("verified", "success"),
    ("revenue gain", "success"),
    ("positive trend", "success"),
    
    # Warning labels
    ("warning", "warning"),
    ("caution", "warning"),
    ("alert", "warning"),
    ("attention required", "warning"),
    ("action needed", "warning"),
    ("slow connection", "warning"),
    ("high usage", "warning"),
    ("nearing limit", "warning"),
    
    # Error labels
    ("error", "error"),
    ("critical", "error"),
    ("failed", "error"),
    ("system failure", "error"),
    ("connection lost", "error"),
    ("revenue loss", "error"),
    ("negative trend", "error"),
    ("not found", "error"),
    
    # Info labels
    ("info", "info"),
    ("note", "info"),
    ("details", "info"),
    ("read more", "info"),
    ("documentation", "info"),
    ("system status", "info"),
    ("user profile", "info")
]

X = [item[0] for item in data]
y = [item[1] for item in data]

# 2. Build and Train Pipeline
print("Training Semantic Context ML Model...")
model = make_pipeline(TfidfVectorizer(ngram_range=(1, 2)), MultinomialNB())
model.fit(X, y)

# 3. Test the Model
test_phrases = ["operation failed", "completed without errors", "pay attention"]
predictions = model.predict(test_phrases)
for phrase, pred in zip(test_phrases, predictions):
    print(f"Phrase: '{phrase}' -> Predicted: '{pred}'")

# 4. Save the Model
joblib.dump(model, "semantic_model.joblib")
print("Model saved to semantic_model.joblib")
