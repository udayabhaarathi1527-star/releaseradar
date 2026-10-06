import pandas as pd
import numpy as np
import json
import joblib

from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder
from sklearn.pipeline import Pipeline

from sklearn.ensemble import ExtraTreesClassifier

from sklearn.metrics import (
    accuracy_score,
    balanced_accuracy_score,
    classification_report,
    confusion_matrix,
    roc_auc_score
)


# ============================================================
# 1. LOAD DATA
# ============================================================

tmdb = pd.read_csv("tmdb_5000_movies.csv")
clean = pd.read_csv("releaseradar_clean.csv")

target = clean[
    ["title", "budget", "success"]
].copy()

df = tmdb.merge(
    target,
    on=["title", "budget"],
    how="inner"
)

print("\n========================================")
print(" RELEASE RADAR - EXTRA TREES EXPERIMENT")
print("========================================")

print(f"\nTotal matched movies: {len(df)}")


# ============================================================
# 2. JSON HELPERS
# ============================================================

def extract_names(value):

    try:

        if pd.isna(value):
            return []

        data = json.loads(value)

        if isinstance(data, list):

            return [
                item.get("name", "Unknown")
                for item in data
                if isinstance(item, dict)
            ]

        return []

    except Exception:

        return []


def extract_count(value):

    try:

        if pd.isna(value):
            return 0

        data = json.loads(value)

        if isinstance(data, list):
            return len(data)

        return 0

    except Exception:

        return 0


# ============================================================
# 3. GENRE / COMPANY FEATURES
# ============================================================

df["genre_list"] = df["genres"].apply(
    extract_names
)

df["company_list"] = df[
    "production_companies"
].apply(
    extract_names
)

df["genre"] = df[
    "genre_list"
].apply(
    lambda x: x[0] if x else "Unknown"
)

df["production_company"] = df[
    "company_list"
].apply(
    lambda x: x[0] if x else "Unknown"
)

df["genre_count"] = df[
    "genre_list"
].apply(len)

df["company_count"] = df[
    "company_list"
].apply(len)

df["keyword_count"] = df[
    "keywords"
].apply(
    extract_count
)

df["country_count"] = df[
    "production_countries"
].apply(
    extract_count
)

df["language_count"] = df[
    "spoken_languages"
].apply(
    extract_count
)


# ============================================================
# 4. TEXT FEATURES
# ============================================================

for column in [
    "overview",
    "tagline",
    "homepage"
]:

    df[column] = (
        df[column]
        .fillna("")
        .astype(str)
    )


df["overview_length"] = (
    df["overview"].str.len()
)

df["overview_word_count"] = (
    df["overview"]
    .str.split()
    .str.len()
)

df["tagline_length"] = (
    df["tagline"].str.len()
)

df["tagline_word_count"] = (
    df["tagline"]
    .str.split()
    .str.len()
)

df["has_homepage"] = (
    df["homepage"]
    .str.strip()
    .ne("")
    .astype(int)
)


# ============================================================
# 5. TITLE FEATURES
# ============================================================

df["title"] = (
    df["title"]
    .fillna("")
    .astype(str)
)

df["title_length"] = (
    df["title"].str.len()
)

df["title_word_count"] = (
    df["title"]
    .str.split()
    .str.len()
)


# ============================================================
# 6. RELEASE DATE
# ============================================================

df["release_date"] = pd.to_datetime(
    df["release_date"],
    errors="coerce"
)

df["release_month"] = (
    df["release_date"].dt.month
)

df["release_year"] = (
    df["release_date"].dt.year
)


# ============================================================
# 7. NUMERIC FEATURES
# ============================================================

df["budget"] = pd.to_numeric(
    df["budget"],
    errors="coerce"
)

df["runtime"] = pd.to_numeric(
    df["runtime"],
    errors="coerce"
)


# Log budget handles very large budget differences
df["log_budget"] = np.log1p(
    df["budget"].clip(lower=0)
)


# Budget relative to runtime
df["budget_per_minute"] = (
    df["budget"] /
    df["runtime"].replace(0, np.nan)
)


# Log runtime
df["log_runtime"] = np.log1p(
    df["runtime"].clip(lower=0)
)


# ============================================================
# 8. RELEASE SEASON FEATURES
# ============================================================

def get_season(month):

    if pd.isna(month):
        return "Unknown"

    month = int(month)

    if month in [12, 1, 2]:
        return "Winter"

    if month in [3, 4, 5]:
        return "Spring"

    if month in [6, 7, 8]:
        return "Summer"

    return "Autumn"


df["release_season"] = (
    df["release_month"]
    .apply(get_season)
)


# Cyclic representation of release month
df["release_month_sin"] = np.sin(
    2 * np.pi *
    df["release_month"].fillna(6) / 12
)

df["release_month_cos"] = np.cos(
    2 * np.pi *
    df["release_month"].fillna(6) / 12
)


# ============================================================
# 9. CLEAN NUMERIC VALUES
# ============================================================

numeric_columns = [

    "budget",
    "runtime",
    "log_budget",
    "budget_per_minute",
    "log_runtime",

    "genre_count",
    "keyword_count",
    "country_count",
    "language_count",
    "company_count",

    "release_month",
    "release_year",

    "overview_length",
    "overview_word_count",

    "tagline_length",
    "tagline_word_count",

    "title_length",
    "title_word_count",

    "has_homepage",

    "release_month_sin",
    "release_month_cos"
]


for column in numeric_columns:

    df[column] = pd.to_numeric(
        df[column],
        errors="coerce"
    )

    df[column] = df[column].replace(
        [np.inf, -np.inf],
        np.nan
    )

    df[column] = df[column].fillna(
        df[column].median()
    )


# ============================================================
# 10. FEATURES
# ============================================================

features = [

    # Financial
    "budget",
    "log_budget",
    "budget_per_minute",

    # Film characteristics
    "runtime",
    "log_runtime",

    # Genre / metadata
    "genre",
    "genre_count",
    "keyword_count",
    "country_count",
    "language_count",

    # Production
    "production_company",
    "company_count",

    # Language
    "original_language",

    # Release
    "release_month",
    "release_year",
    "release_season",
    "release_month_sin",
    "release_month_cos",

    # Description
    "overview_length",
    "overview_word_count",
    "tagline_length",
    "tagline_word_count",

    # Title
    "title_length",
    "title_word_count",

    # Website
    "has_homepage"
]


X = df[features].copy()

y = df["success"].astype(int)


# ============================================================
# 11. DATA INFORMATION
# ============================================================

print("\nFEATURES USED:")

for feature in features:
    print(" -", feature)


print("\nTARGET DISTRIBUTION:")

print(
    y.value_counts()
)


print("\nTARGET PERCENTAGE:")

print(
    y.value_counts(
        normalize=True
    ) * 100
)


# ============================================================
# 12. SUCCESS BY BUDGET
# ============================================================

print("\nSUCCESS BY BUDGET:")

print(
    df.groupby("success")["budget"]
    .agg([
        "count",
        "mean",
        "median",
        "min",
        "max"
    ])
)


# ============================================================
# 13. TRAIN / TEST
# ============================================================

X_train, X_test, y_train, y_test = train_test_split(

    X,
    y,

    test_size=0.20,

    random_state=42,

    stratify=y
)


print(
    f"\nTraining movies: {len(X_train)}"
)

print(
    f"Testing movies: {len(X_test)}"
)


# ============================================================
# 14. PREPROCESSING
# ============================================================

categorical_features = [

    "genre",

    "production_company",

    "original_language",

    "release_season"
]


numeric_features = [

    "budget",
    "log_budget",
    "budget_per_minute",

    "runtime",
    "log_runtime",

    "genre_count",
    "keyword_count",
    "country_count",
    "language_count",

    "company_count",

    "release_month",
    "release_year",

    "release_month_sin",
    "release_month_cos",

    "overview_length",
    "overview_word_count",

    "tagline_length",
    "tagline_word_count",

    "title_length",
    "title_word_count",

    "has_homepage"
]


preprocessor = ColumnTransformer(

    transformers=[

        (
            "categorical",

            OneHotEncoder(

                handle_unknown="ignore",

                min_frequency=3,

                sparse_output=False

            ),

            categorical_features
        ),

        (
            "numeric",

            "passthrough",

            numeric_features
        )

    ]
)


# ============================================================
# 15. EXTRA TREES MODEL
# ============================================================

model = ExtraTreesClassifier(

    n_estimators=1000,

    max_depth=14,

    min_samples_split=6,

    min_samples_leaf=2,

    max_features="sqrt",

    class_weight="balanced",

    random_state=42,

    n_jobs=-1
)


# ============================================================
# 16. PIPELINE
# ============================================================

pipeline = Pipeline([

    (
        "preprocessor",
        preprocessor
    ),

    (
        "model",
        model
    )

])


# ============================================================
# 17. TRAIN
# ============================================================

print("\nTraining Extra Trees model...")

pipeline.fit(
    X_train,
    y_train
)


# ============================================================
# 18. PREDICTION
# ============================================================

y_probability = pipeline.predict_proba(
    X_test
)[:, 1]


y_pred = (
    y_probability >= 0.50
).astype(int)


# ============================================================
# 19. RESULTS
# ============================================================

print("\n" + "=" * 45)
print("              RESULTS")
print("=" * 45)


accuracy = accuracy_score(
    y_test,
    y_pred
)


balanced_accuracy = (
    balanced_accuracy_score(
        y_test,
        y_pred
    )
)


roc_auc = roc_auc_score(
    y_test,
    y_probability
)


print(
    f"\nAccuracy: "
    f"{accuracy * 100:.2f}%"
)


print(
    f"Balanced Accuracy: "
    f"{balanced_accuracy * 100:.2f}%"
)


print(
    f"ROC-AUC: "
    f"{roc_auc:.4f}"
)


print(
    "\nClassification Report:"
)


print(
    classification_report(

        y_test,

        y_pred,

        target_names=[
            "Not Successful",
            "Successful"
        ]
    )
)


print(
    "\nConfusion Matrix:"
)


print(
    confusion_matrix(
        y_test,
        y_pred
    )
)


# ============================================================
# 20. BASELINE
# ============================================================

baseline_accuracy = max(
    y_test.value_counts(
        normalize=True
    )
)


print("\n" + "=" * 45)
print("              BASELINE")
print("=" * 45)


print(
    f"Always predicting SUCCESS: "
    f"{baseline_accuracy * 100:.2f}%"
)


print(
    f"Model improvement over baseline: "
    f"{(accuracy - baseline_accuracy) * 100:.2f} "
    f"percentage points"
)


# ============================================================
# 21. THRESHOLD ANALYSIS
# ============================================================

print("\n" + "=" * 45)
print("          THRESHOLD ANALYSIS")
print("=" * 45)


best_threshold = 0.50

best_accuracy = 0

best_balanced_accuracy = 0


for threshold in np.arange(
    0.20,
    0.81,
    0.01
):

    threshold_pred = (
        y_probability >= threshold
    ).astype(int)


    threshold_accuracy = (
        accuracy_score(
            y_test,
            threshold_pred
        )
    )


    threshold_balanced_accuracy = (
        balanced_accuracy_score(
            y_test,
            threshold_pred
        )
    )


    print(
        f"Threshold {threshold:.2f} | "
        f"Accuracy: "
        f"{threshold_accuracy:.3f} | "
        f"Balanced Accuracy: "
        f"{threshold_balanced_accuracy:.3f}"
    )


    if (
        threshold_balanced_accuracy
        > best_balanced_accuracy
    ):

        best_balanced_accuracy = (
            threshold_balanced_accuracy
        )

        best_accuracy = (
            threshold_accuracy
        )

        best_threshold = threshold


# ============================================================
# 22. BEST THRESHOLD
# ============================================================

print("\n" + "=" * 45)
print("          BEST THRESHOLD")
print("=" * 45)


print(
    f"Best threshold: "
    f"{best_threshold:.2f}"
)


print(
    f"Best threshold accuracy: "
    f"{best_accuracy * 100:.2f}%"
)


print(
    f"Best threshold balanced accuracy: "
    f"{best_balanced_accuracy * 100:.2f}%"
)


# ============================================================
# 23. FEATURE IMPORTANCE
# ============================================================

print("\n" + "=" * 45)
print("        TOP FEATURE IMPORTANCE")
print("=" * 45)


model_fitted = pipeline.named_steps[
    "model"
]

preprocessor_fitted = (
    pipeline.named_steps[
        "preprocessor"
    ]
)


feature_names = (
    preprocessor_fitted
    .get_feature_names_out()
)


importances = (
    model_fitted.feature_importances_
)


importance_df = pd.DataFrame({

    "feature": feature_names,

    "importance": importances

})


importance_df = (
    importance_df
    .sort_values(
        "importance",
        ascending=False
    )
)


print(
    importance_df.head(25)
    .to_string(index=False)
)


# ============================================================
# 24. SAVE MODEL
# ============================================================

joblib.dump(
    pipeline,
    "release_radar_model.pkl"
)


print(
    "\nModel saved as "
    "release_radar_model.pkl"
)


print(
    "\nTraining completed successfully."
)