import pandas as pd
import json
import numpy as np

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import MultiLabelBinarizer
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    roc_auc_score
)


# ==================================================
# 1. Load datasets
# ==================================================

clean = pd.read_csv("releaseradar_clean.csv")
tmdb = pd.read_csv("tmdb_5000_movies.csv")


# ==================================================
# 2. Recover revenue
# ==================================================

df = clean.merge(
    tmdb[["title", "budget", "revenue"]],
    on=["title", "budget"],
    how="left"
)


# ==================================================
# 3. Create target
#
# Strong Success = Revenue >= 2 × Budget
# ==================================================

df["strong_success"] = (
    df["revenue"] >= 2 * df["budget"]
).astype(int)


# ==================================================
# 4. JSON extraction helpers
# ==================================================

def extract_names(value):

    try:

        data = json.loads(value)

        if isinstance(data, list):

            names = []

            for item in data:

                if isinstance(item, dict):

                    name = item.get("name")

                    if name:
                        names.append(name)

            return names

    except:

        pass

    return []


# ==================================================
# 5. Extract genres
# ==================================================

df["genre_list"] = df["genres"].apply(
    extract_names
)

df["genre_count"] = df["genre_list"].apply(
    len
)


# ==================================================
# 6. Extract production companies
# ==================================================

df["company_list"] = df[
    "production_companies"
].apply(
    extract_names
)

df["company_count"] = df[
    "company_list"
].apply(
    len
)


# ==================================================
# 7. Main production company
# ==================================================

df["main_company"] = df[
    "company_list"
].apply(
    lambda x: x[0] if len(x) > 0 else "Unknown"
)


# ==================================================
# 8. Additional numerical features
# ==================================================

df["budget_log"] = np.log1p(
    df["budget"]
)

df["runtime_squared"] = (
    df["runtime"] ** 2
)

df["release_decade"] = (
    (df["release_year"] // 10) * 10
)

df["budget_per_minute"] = (
    df["budget"] /
    df["runtime"].replace(0, np.nan)
)

df["budget_per_minute"] = (
    df["budget_per_minute"].fillna(
        df["budget_per_minute"].median()
    )
)


# ==================================================
# 9. Multi-label genre encoding
# ==================================================

genre_encoder = MultiLabelBinarizer()

genre_encoded = genre_encoder.fit_transform(
    df["genre_list"]
)

genre_columns = [
    "genre_" + str(x)
    for x in genre_encoder.classes_
]

genre_df = pd.DataFrame(
    genre_encoded,
    columns=genre_columns,
    index=df.index
)


# ==================================================
# 10. Base features
# ==================================================

base_features = [
    "budget",
    "runtime",
    "release_month",
    "release_year",
    "genre_count",
    "company_count",
    "original_language",
    "main_company"
]

X_base = df[base_features].copy()

y = df["strong_success"]


# ==================================================
# 11. One-hot encode categorical features
# ==================================================

X_base = pd.get_dummies(
    X_base,
    columns=[
        "original_language",
        "main_company"
    ],
    dtype=int
)


# ==================================================
# 12. Combine genre + base features
# ==================================================

X = pd.concat(
    [
        X_base,
        genre_df
    ],
    axis=1
)


# ==================================================
# 13. Train / Test split
# ==================================================

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y
)


# ==================================================
# 14. Random Forest
# ==================================================

model = RandomForestClassifier(
    n_estimators=500,
    max_depth=12,
    min_samples_leaf=3,
    random_state=42,
    class_weight="balanced_subsample",
    n_jobs=-1
)


# ==================================================
# 15. Train
# ==================================================

print("Training ReleaseRadar V2...")

model.fit(
    X_train,
    y_train
)


# ==================================================
# 16. Predictions
# ==================================================

y_pred = model.predict(
    X_test
)

y_probability = model.predict_proba(
    X_test
)[:, 1]


# ==================================================
# 17. Evaluation
# ==================================================

accuracy = accuracy_score(
    y_test,
    y_pred
)

roc_auc = roc_auc_score(
    y_test,
    y_probability
)


print("\n========================================")
print("       RELEASE RADAR V2 RESULTS")
print("========================================")

print(
    f"\nAccuracy: {accuracy * 100:.2f}%"
)

print(
    f"ROC-AUC: {roc_auc:.4f}"
)


print("\nClassification Report:")

print(
    classification_report(
        y_test,
        y_pred,
        target_names=[
            "Not Strong Success",
            "Strong Success"
        ],
        zero_division=0
    )
)


print("\nConfusion Matrix:")

print(
    confusion_matrix(
        y_test,
        y_pred
    )
)


# ==================================================
# 18. Feature importance
# ==================================================

importances = pd.Series(
    model.feature_importances_,
    index=X.columns
)

top_features = (
    importances
    .sort_values(ascending=False)
    .head(15)
)


print("\nTop 15 Features:")

print(
    top_features.to_string()
)


# ==================================================
# 19. Dataset summary
# ==================================================

print("\nDataset:")

print(
    f"Total movies: {len(df)}"
)

print(
    f"Training movies: {len(X_train)}"
)

print(
    f"Testing movies: {len(X_test)}"
)

print("\nTarget distribution:")

print(
    y.value_counts()
)

print("\nTarget percentages:")

print(
    y.value_counts(
        normalize=True
    ).round(3)
)