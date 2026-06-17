const DJANGO_URL = "http://127.0.0.1:8000/api";

// Django's new engine matches by TITLE against its own pre-trained dataset,
// so we just send an array of title strings — no more "allMovies" pool needed.
export const getBlindSpotRecommendations = async (favourites) => {
    const titles = favourites.map(movie => movie.Title);

    const response = await fetch(`${DJANGO_URL}/recommend/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            favourites: titles,
            mode: "blindspot"
        })
    });
    const data = await response.json();
    return data;
};

export const getGroupRecommendations = async (usersMovies) => {
    // usersMovies[0] = first (and currently only) user's favourite movie objects
    const titles = usersMovies[0].map(movie => movie.Title);

    const response = await fetch(`${DJANGO_URL}/group-recommend/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            favourites: titles
        })
    });
    const data = await response.json();
    return data;
};