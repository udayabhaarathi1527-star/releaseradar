import pandas as pd
import joblib

# Load trained model
model = joblib.load("release_radar_model.pkl")

# Example movie
movie = pd.DataFrame([{
    "budget": 50,
    "marketing_budget": 15,
    "rating": 8.0,
    "runtime": 145,
    "star_power": 3,
    "competition": 2,
    "genre": "Action",
    "release_month": 5
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