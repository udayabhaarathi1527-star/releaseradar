
import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score


# Load dataset
data = pd.read_csv("dataset.csv")

# Features and target
X = data.drop("success", axis=1)
y = data["success"]

# Categorical and numerical columns
categorical_features = ["genre"]
numerical_features = [
    "budget",
    "marketing_budget",
    "rating",
    "runtime",
    "star_power",
    "competition",
    "release_month"
]

# Preprocessing
preprocessor = ColumnTransformer(
    transformers=[
        (
            "genre",
            OneHotEncoder(handle_unknown="ignore"),
            categorical_features
        )
    ],
    remainder="passthrough"
)

# ML model
model = RandomForestClassifier(
    n_estimators=100,
    random_state=42
)

# Complete pipeline
pipeline = Pipeline(
    steps=[
        ("preprocessor", preprocessor),
        ("model", model)
    ]
)

# Split dataset
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
    stratify=y
)

# Train
pipeline.fit(X_train, y_train)

# Test
predictions = pipeline.predict(X_test)

accuracy = accuracy_score(y_test, predictions)

print("--------------------------------")
print("ReleaseRadar ML Model")
print("--------------------------------")
print(f"Model Accuracy: {accuracy * 100:.2f}%")

# Save model
joblib.dump(pipeline, "release_radar_model.pkl")

print("Model saved as release_radar_model.pkl")