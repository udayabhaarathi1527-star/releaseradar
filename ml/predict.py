import pandas as pd
import joblib
import os

# Get current ML folder
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Load trained model
model_path = os.path.join(
    BASE_DIR,
    "release_radar_model.pkl"
)

model = joblib.load(model_path)

# Example movie
movie = pd.DataFrame([{
    "budget": 50000000,
    "runtime": 145,
    "genre": "Action",
    "original_language": "en",
    "production_company": "Warner Bros.",
    "release_month": 5,
    "release_year": 2026
}])

# Prediction
prediction = model.predict(movie)[0]

# Probability
probability = model.predict_proba(movie)[0][1] * 100

print("--------------------------------")
print("ReleaseRadar Prediction")
print("--------------------------------")

if prediction == 1:
    print("Prediction: SUCCESS")
else:
    print("Prediction: NOT SUCCESSFUL")

print(f"Success Probability: {probability:.2f}%")