import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
import joblib
import os

# Ensure models folder exists
os.makedirs("models", exist_ok=True)

# Load dataset
data = pd.read_csv(r"C:\Users\admin\Desktop\resume_screening_app\data\Resume.csv")   

# Features & Labels
X = data["Resume"]
y = data["Category"]

# Vectorizer
vectorizer = TfidfVectorizer(stop_words="english", max_features=5000)
X_vec = vectorizer.fit_transform(X)

# Train model
model = MultinomialNB()
model.fit(X_vec, y)

# Save model & vectorizer
joblib.dump(model, "models/resume_model.pkl")
joblib.dump(vectorizer, "models/vectorizer.pkl")

print("✅ Model and vectorizer saved in 'models/' folder")
