"""
recommendation_engine.py

Loads the pre-trained ML artifacts (exported from the Colab notebook) ONCE
when Django starts, and exposes simple functions the views can call.

Artifacts expected in recommender/ml_models/:
    tfidf_vectorizer.pkl  - fitted TfidfVectorizer (trained on movie overviews)
    tfidf_matrix.pkl      - TF-IDF matrix for every movie in the dataset
    rf_model.pkl          - RandomForestClassifier (solo=0 / group=1)
    movies_lookup.pkl     - DataFrame with title, genres, runtime, popularity,
                             vote_count, release_year, predicted_viewing
"""

import os
import pickle
import numpy as np
import pandas as pd
from difflib import SequenceMatcher

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ML_DIR = os.path.join(BASE_DIR, "ml_models")

# ── Load everything once at import time (Django imports this module once per process) ──
with open(os.path.join(ML_DIR, "tfidf_vectorizer.pkl"), "rb") as f:
    tfidf = pickle.load(f)

with open(os.path.join(ML_DIR, "tfidf_matrix.pkl"), "rb") as f:
    tfidf_matrix = pickle.load(f)

with open(os.path.join(ML_DIR, "rf_model.pkl"), "rb") as f:
    rf_model = pickle.load(f)

movies_df = pd.read_pickle(os.path.join(ML_DIR, "movies_lookup.pkl"))

print(f"[recommendation_engine] Loaded {movies_df.shape[0]:,} movies, "
      f"TF-IDF matrix {tfidf_matrix.shape}, RF model ready.")


def _normalize_title(title):
    """Lowercase + strip, used for matching."""
    return str(title).strip().lower()


def find_movie_index(title, year=None):
    """
    Find the row index in movies_df matching a given title.
    Tries exact match first, then fuzzy match as a fallback
    (since TMDB titles may differ slightly from the Kaggle dataset titles).
    Returns None if nothing reasonably close is found.
    """
    target = _normalize_title(title)

    # 1. Exact match (optionally narrowed by year if provided)
    exact = movies_df[movies_df["title"].str.lower().str.strip() == target]
    if year and not exact.empty:
        year_match = exact[exact["release_year"] == int(year)]
        if not year_match.empty:
            return year_match.index[0]
    if not exact.empty:
        return exact.index[0]

    # 2. Fuzzy match fallback — find the closest title by similarity ratio
    best_idx, best_score = None, 0.0
    for idx, row_title in movies_df["title"].items():
        score = SequenceMatcher(None, target, _normalize_title(row_title)).ratio()
        if score > best_score:
            best_score, best_idx = score, idx

    # Only accept fuzzy matches that are reasonably confident
    if best_score >= 0.85:
        return best_idx

    return None


def get_recommendations(favourite_titles, mode="blindspot", top_n=10):
    """
    favourite_titles: list of movie title strings (e.g. from the user's
                       Supabase favourites, sent as plain titles from React)
    mode: "blindspot" or "group"
    Returns a list of dicts ready to send back to React.
    """
    # 1. Map each favourite title to a row index in our dataset
    fav_indices = []
    not_found = []
    for title in favourite_titles:
        idx = find_movie_index(title)
        if idx is not None:
            fav_indices.append(idx)
        else:
            not_found.append(title)

    if not fav_indices:
        return {
            "recommendations": [],
            "error": "None of your favourites were found in our dataset.",
            "not_found": not_found,
        }

    # 2. Build a "taste profile" vector by averaging the TF-IDF vectors
    #    of all the user's favourite movies
    fav_vectors = tfidf_matrix[fav_indices]
    user_profile = np.asarray(fav_vectors.mean(axis=0))

    # 3. Compare the taste profile against every movie in the dataset
    similarities = np.asarray(
        (tfidf_matrix @ user_profile.T)
    ).flatten()  # cosine-like score since tfidf rows are L2-normalized by default

    df = movies_df.copy()
    df["score"] = similarities

    # 4. Exclude movies the user already has as favourites
    df = df.drop(index=fav_indices, errors="ignore")

    # 5. Filter by mode using the Random Forest's predicted_viewing label
    target_label = 1 if mode == "group" else 0
    filtered = df[df["predicted_viewing"] == target_label]

    # Fallback — if filtering by mode leaves too few results, relax it
    if filtered.shape[0] < top_n:
        filtered = df

    # 6. Blend similarity with popularity for a more balanced ranking
    filtered = filtered.copy()
    max_pop = filtered["popularity"].max() or 1
    filtered["popularity_norm"] = filtered["popularity"] / max_pop
    filtered["final_score"] = (filtered["score"] * 0.75) + (filtered["popularity_norm"] * 0.25)

    filtered = filtered.sort_values("final_score", ascending=False).head(top_n)

    results = filtered[["title", "genres", "runtime", "popularity", "release_year", "score"]]
    results = results.replace({float("nan"): None}).to_dict(orient="records")

    return {"recommendations": results, "not_found": not_found}