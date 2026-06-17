from rest_framework.decorators import api_view
from rest_framework.response import Response
from . import recommendation_engine


@api_view(["POST"])
def recommend(request):
    """
    Expects: { "favourites": ["Inception", "Interstellar", ...], "mode": "blindspot" }
    favourites is now just a list of TITLE STRINGS (from the user's saved
    favourites on the frontend) — no need to send a big "allMovies" pool anymore,
    since the pre-trained dataset already lives inside Django.
    """
    favourite_titles = request.data.get("favourites", [])
    mode = request.data.get("mode", "blindspot")

    if not favourite_titles:
        return Response({"error": "Missing favourites"}, status=400)

    result = recommendation_engine.get_recommendations(favourite_titles, mode=mode, top_n=10)
    return Response(result)


@api_view(["POST"])
def group_recommend(request):
    """
    Expects: { "favourites": ["Inception", "Interstellar", ...] }
    Uses the same engine but always in "group" mode.
    """
    favourite_titles = request.data.get("favourites", [])

    if not favourite_titles:
        return Response({"error": "Missing favourites"}, status=400)

    result = recommendation_engine.get_recommendations(favourite_titles, mode="group", top_n=10)
    return Response(result)