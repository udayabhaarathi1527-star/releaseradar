import argparse
import json
from datetime import datetime
from pathlib import Path

import joblib
import pandas as pd


MODEL_PATH = Path(__file__).with_name("shortfilm_model.pkl")

# Threshold selected during model validation.
THRESHOLD = 0.60

FEATURES = [
    "startYear",
    "runtimeMinutes",
    "genres",
    "title_length",
    "title_word_count",
    "genre_count",
]


def parse_args():
    parser = argparse.ArgumentParser(
        description="Predict short-film success using the ReleaseRadar short-film model."
    )

    parser.add_argument(
        "--title",
        type=str,
        required=True,
        help="Short-film title.",
    )

    parser.add_argument(
        "--genre",
        type=str,
        required=True,
        help="Primary short-film genre.",
    )

    parser.add_argument(
        "--duration",
        type=float,
        required=True,
        help="Expected runtime in minutes.",
    )

    parser.add_argument(
        "--start-year",
        type=int,
        default=datetime.now().year,
        help="Planned release/production year.",
    )

    return parser.parse_args()


def build_genres(genre):
    """
    The training data uses IMDb-style genre strings such as:
    'Documentary,Short'
    'Animation,Comedy,Romance'

    ReleaseRadar asks the user for one primary genre, so we
    append 'Short' to match the training-data format.
    """

    genre = str(genre).strip()

    if not genre:
        return "Short"

    # Avoid adding Short twice.
    parts = [
        part.strip()
        for part in genre.split(",")
        if part.strip()
    ]

    if not any(part.lower() == "short" for part in parts):
        parts.append("Short")

    return ",".join(parts)


def main():
    args = parse_args()

    title = args.title.strip()
    genre = build_genres(args.genre)

    duration = max(float(args.duration), 0.0)
    start_year = int(args.start_year)

    title_length = len(title)
    title_word_count = len(title.split())

    genre_count = len(
        [
            part
            for part in genre.split(",")
            if part.strip()
        ]
    )

    row = {
        "startYear": start_year,
        "runtimeMinutes": duration,
        "genres": genre,
        "title_length": title_length,
        "title_word_count": title_word_count,
        "genre_count": genre_count,
    }

    frame = pd.DataFrame(
        [row],
        columns=FEATURES,
    )

    model = joblib.load(MODEL_PATH)

    probability = float(
        model.predict_proba(frame)[0, 1]
    )

    prediction = int(
        probability >= THRESHOLD
    )

    percent_probability = round(
        probability * 100,
        2,
    )

    output = {
        "prediction": (
            "SUCCESS"
            if prediction == 1
            else "NOT SUCCESSFUL"
        ),
        "success_probability": percent_probability,
        "threshold": THRESHOLD,
        "target_label": (
            "success"
            if prediction == 1
            else "not_successful"
        ),
        "feature_set": "SHORT_FILM_SUCCESS_MODEL",
        "model": "shortfilm_model.pkl",
        "model_inputs": {
            "startYear": start_year,
            "runtimeMinutes": duration,
            "genres": genre,
            "title_length": title_length,
            "title_word_count": title_word_count,
            "genre_count": genre_count,
        },
    }

    print(json.dumps(output, indent=2))


if __name__ == "__main__":
    main()