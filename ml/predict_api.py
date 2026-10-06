import sys
import json
import os
import math
import pandas as pd
import joblib
import numpy as np


# ============================================================
# BASE DIRECTORY
# ============================================================

BASE_DIR = os.path.dirname(
    os.path.abspath(__file__)
)


# ============================================================
# LOAD MODEL
# ============================================================

model_path = os.path.join(
    BASE_DIR,
    "release_radar_model.pkl"
)

model = joblib.load(model_path)


# ============================================================
# READ INPUTS FROM NODE.JS
#
# Arguments:
#
# 1  budget
# 2  runtime
# 3  genre
# 4  original_language
# 5  production_company
# 6  release_month
# 7  release_year
#
# Optional:
#
# 8  overview
# 9  tagline
# 10 homepage
# 11 keywords_count
# 12 country_count
# 13 language_count
# 14 company_count
# 15 genre_count
# ============================================================

budget = float(sys.argv[1])

runtime = float(sys.argv[2])

genre = sys.argv[3]

original_language = sys.argv[4]

production_company = sys.argv[5]

release_month = int(
    sys.argv[6]
)

release_year = int(
    sys.argv[7]
)


# Optional values
overview = (
    sys.argv[8]
    if len(sys.argv) > 8
    else ""
)

tagline = (
    sys.argv[9]
    if len(sys.argv) > 9
    else ""
)

homepage = (
    sys.argv[10]
    if len(sys.argv) > 10
    else ""
)


# ============================================================
# OPTIONAL METADATA
# ============================================================

keyword_count = int(
    sys.argv[11]
) if len(sys.argv) > 11 else 0


country_count = int(
    sys.argv[12]
) if len(sys.argv) > 12 else 1


language_count = int(
    sys.argv[13]
) if len(sys.argv) > 13 else 1


company_count = int(
    sys.argv[14]
) if len(sys.argv) > 14 else 1


genre_count = int(
    sys.argv[15]
) if len(sys.argv) > 15 else 1


# ============================================================
# TEXT FEATURES
# ============================================================

overview = str(overview)

tagline = str(tagline)

homepage = str(homepage)


overview_length = len(
    overview
)

overview_word_count = len(
    overview.split()
)

tagline_length = len(
    tagline
)

tagline_word_count = len(
    tagline.split()
)

# ============================================================
# TITLE
# ============================================================

title = str(sys.argv[16]) if len(sys.argv) > 16 else ""

title_length = len(title)

title_word_count = len(title.split())
# ============================================================
# BUDGET FEATURES
# ============================================================

log_budget = math.log1p(
    max(budget, 0)
)


if runtime > 0:

    budget_per_minute = (
        budget / runtime
    )

else:

    budget_per_minute = 0


log_runtime = math.log1p(
    max(runtime, 0)
)


# ============================================================
# RELEASE SEASON
# ============================================================

if release_month in [12, 1, 2]:

    release_season = "Winter"

elif release_month in [3, 4, 5]:

    release_season = "Spring"

elif release_month in [6, 7, 8]:

    release_season = "Summer"

elif release_month in [9, 10, 11]:

    release_season = "Autumn"

else:

    release_season = "Unknown"


# ============================================================
# CYCLIC MONTH FEATURES
# ============================================================

release_month_sin = math.sin(
    2 * math.pi *
    release_month / 12
)

release_month_cos = math.cos(
    2 * math.pi *
    release_month / 12
)


# ============================================================
# HOMEPAGE
# ============================================================

has_homepage = (
    1
    if homepage.strip()
    else 0
)


# ============================================================
# CREATE DATAFRAME
# ============================================================

movie = pd.DataFrame([{

    "budget":
        budget,

    "log_budget":
        log_budget,

    "budget_per_minute":
        budget_per_minute,

    "runtime":
        runtime,

    "log_runtime":
        log_runtime,

    "genre":
        genre,

    "genre_count":
        genre_count,

    "keyword_count":
        keyword_count,

    "country_count":
        country_count,

    "language_count":
        language_count,

    "production_company":
        production_company,

    "company_count":
        company_count,

    "original_language":
        original_language,

    "release_month":
        release_month,

    "release_year":
        release_year,

    "release_season":
        release_season,

    "release_month_sin":
        release_month_sin,

    "release_month_cos":
        release_month_cos,

    "overview_length":
        overview_length,

    "overview_word_count":
        overview_word_count,

    "tagline_length":
        tagline_length,

    "tagline_word_count":
        tagline_word_count,

    "title_length":
        title_length,

    "title_word_count":
        title_word_count,

    "has_homepage":
        has_homepage

}])


# ============================================================
# PREDICTION
# ============================================================

prediction = int(
    model.predict(movie)[0]
)


# ============================================================
# PROBABILITY
# ============================================================

probability = float(
    model.predict_proba(movie)[0][1]
    * 100
)


# ============================================================
# RESULT
# ============================================================

result = {

    "prediction":
        "SUCCESS"
        if prediction == 1
        else "NOT SUCCESSFUL",

    "success_probability":
        round(
            probability,
            2
        )

}


# ============================================================
# RETURN JSON
# ============================================================

print(
    json.dumps(result)
)