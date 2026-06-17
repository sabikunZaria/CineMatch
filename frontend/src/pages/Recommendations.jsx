import { useState } from "react";
import { useMoviecontext } from "../contexts/Moviecontext";
import { getBlindSpotRecommendations, getGroupRecommendations } from "../services/recommendationService";
import { searchMovies } from "../services/api";
import MovieCard from "../components/MovieCard";
import "../css/Recommendations.css";

function Recommendations() {
    const { favourites } = useMoviecontext();
    const [mode, setMode] = useState(null);
    const [results, setResults] = useState([]);
    const [notFound, setNotFound] = useState([]);
    const [loading, setLoading] = useState(false);
    const [postersLoading, setPostersLoading] = useState(false);
    const [error, setError] = useState(null);

    // Django gives us { title, genres, runtime, popularity, release_year, score }
    // but no poster — so for each result, look it up on TMDB by title and
    // merge in the poster/imdbID so MovieCard can render it normally.
    const enrichWithPosters = async (djangoResults) => {
        setPostersLoading(true);
        const enriched = await Promise.all(
            djangoResults.map(async (rec) => {
                try {
                    const tmdbMatches = await searchMovies(rec.title);
                    const bestMatch = tmdbMatches[0]; // TMDB sorts by relevance/popularity

                    if (bestMatch) {
                        return {
                            ...bestMatch,           // gives Poster, imdbID, Title, etc.
                            matchScore: rec.score,  // keep Django's similarity score
                        };
                    }
                } catch (err) {
                    console.error("Poster lookup failed for", rec.title, err);
                }
                // Fallback — no TMDB match found, show a text-only placeholder card
                return {
                    imdbID: `unmatched-${rec.title}`,
                    Title: rec.title,
                    Poster: "fallback-image-url.png",
                    Released: String(rec.release_year),
                    matchScore: rec.score,
                };
            })
        );
        setPostersLoading(false);
        return enriched;
    };

    const handleBlindSpot = async () => {
        if (favourites.length === 0) {
            setError("Add some favourites first!");
            return;
        }
        setLoading(true);
        setError(null);
        setResults([]);
        setMode("blindspot");
        try {
            const data = await getBlindSpotRecommendations(favourites);
            if (data.error) {
                setError(data.error);
            } else {
                setNotFound(data.not_found || []);
                const enriched = await enrichWithPosters(data.recommendations || []);
                setResults(enriched);
            }
        } catch (err) {
            setError("Something went wrong. Is Django running?");
        } finally {
            setLoading(false);
        }
    };

    const handleGroupRecommend = async () => {
        if (favourites.length === 0) {
            setError("Add some favourites first!");
            return;
        }
        setLoading(true);
        setError(null);
        setResults([]);
        setMode("group");
        try {
            const data = await getGroupRecommendations([favourites]);
            if (data.error) {
                setError(data.error);
            } else {
                setNotFound(data.not_found || []);
                const enriched = await enrichWithPosters(data.recommendations || []);
                setResults(enriched);
            }
        } catch (err) {
            setError("Something went wrong. Is Django running?");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="recommendations-page">
            <h2 className="page-title">Find Your Next Movie</h2>

            <div className="mode-buttons">
                <button className="mode-btn blindspot" onClick={handleBlindSpot}>
                    🎯 Blind Spot
                    <span>Discover outside your comfort zone</span>
                </button>
                <button className="mode-btn group" onClick={handleGroupRecommend}>
                    👥 Group Pick
                    <span>Best movies for a group night 🍿</span>
                </button>
            </div>

            {loading && <p className="loading">Finding movies for you...</p>}
            {postersLoading && <p className="loading">Fetching posters...</p>}
            {error && <p className="error-message">{error}</p>}

            {notFound.length > 0 && (
                <p className="not-found-note">
                    ⚠️ Not found in our dataset: {notFound.join(", ")}
                </p>
            )}

            {results.length > 0 && (
                <div className="results-section">
                    <h3>
                        {mode === "blindspot"
                            ? "🎯 Your Blind Spot Picks"
                            : "👥 Best Group Picks"}
                    </h3>
                    <div className="movie-grid">
                        {results.map((movie) => (
                            <div className="recommend-wrapper" key={movie.imdbID}>
                                <MovieCard movie={movie} />
                                <span className="match-badge">
                                    {Math.round(movie.matchScore * 100)}% match
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default Recommendations;