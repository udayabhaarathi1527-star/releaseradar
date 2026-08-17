import sys
import json
import os
import pandas as pd
import joblib

# Get the folder where this Python file is located
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Load trained model using an absolute path
model_path = os.path.join(BASE_DIR, "release_radar_model.pkl")
model = joblib.load(model_path)
# Read values from Node.js
budget = float(sys.argv[1])
marketing_budget = float(sys.argv[2])
rating = float(sys.argv[3])
runtime = float(sys.argv[4])
star_power = int(sys.argv[5])
competition = int(sys.argv[6])
genre = sys.argv[7]
release_month = int(sys.argv[8])

# Create movie data
movie = pd.DataFrame([{
    "budget": budget,
    "marketing_budget": marketing_budget,
    "rating": rating,
    "runtime": runtime,
    "star_power": star_power,
    "competition": competition,
    "genre": genre,
    "release_month": release_month
}])

# Make prediction
prediction = int(model.predict(movie)[0])

# Get probability
probability = float(
    model.predict_proba(movie)[0][1] * 100
)

# Return JSON
result = {
    "prediction": "SUCCESS" if prediction == 1 else "NOT SUCCESSFUL",
    "success_probability": round(probability, 2)
}

print(json.dumps(result))