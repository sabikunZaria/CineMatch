import MovieCard from "../components/MovieCard";
import { useState, useEffect } from "react";
import { searchMovies, getPopularMovies, discoverMovies, getGenreList } from "../services/api";
import '../css/Home.css';

const YEARS = ["All", "2020s", "2010s", "2000s", "90s", "80s", "Older"];
const COUNTRIES = [
  { label: "All", code: "" },
  { label: "USA", code: "US" },
  { label: "UK", code: "GB" },
  { label: "India", code: "IN" },
  { label: "France", code: "FR" },
  { label: "South Korea", code: "KR" },
  { label: "Japan", code: "JP" },
];

function Home() {
    const [searchQuery, setSearchQuery] = useState("");
    const [movies, setMovies] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showFilters, setShowFilters] = useState(false);

    const [genres, setGenres] = useState([]); // [{id, name}] from TMDB
    const [selectedGenreId, setSelectedGenreId] = useState("");   // "" = All
    const [selectedYear, setSelectedYear] = useState("All");
    const [selectedCountry, setSelectedCountry] = useState("");   // "" = All

    // Load genre list once on mount — needed to render genre chips with real TMDB ids
    useEffect(() => {
        const loadGenres = async () => {
            try {
                const genreList = await getGenreList();
                setGenres([{ id: "", name: "All" }, ...genreList]);
            } catch (err) {
                console.error("Failed to load genres:", err);
            }
        };
        loadGenres();
    }, []);

    // Initial load — popular movies
    useEffect(() => {
        const loadPopularMovies = async () => {
            setLoading(true);
            try {
                const popular = await getPopularMovies();
                setMovies(popular);
            } catch (err) {
                setError("Failed to load movies.");
            } finally {
                setLoading(false);
            }
        };
        loadPopularMovies();
    }, []);

    const getYearValue = (label) => {
        // discover/movie's primary_release_year only accepts ONE exact year,
        // so for decade labels we pick a representative year that returns
        // a good spread of movies from that decade.
        switch (label) {
            case "2020s": return 2023;
            case "2010s": return 2015;
            case "2000s": return 2005;
            case "90s":   return 1995;
            case "80s":   return 1985;
            case "Older": return 1970;
            default:      return null;
        }
    };

    // Runs whenever a filter changes — calls TMDB's server-side discover endpoint
    useEffect(() => {
        const hasFilters = selectedGenreId !== "" || selectedYear !== "All" || selectedCountry !== "";
        if (!hasFilters) return; // no filters active, keep showing popular/search results

        const runDiscover = async () => {
            setLoading(true);
            setError(null);
            try {
                const results = await discoverMovies({
                    genreId: selectedGenreId || null,
                    year: getYearValue(selectedYear),
                    country: selectedCountry || null,
                });
                setMovies(results);
            } catch (err) {
                setError("Failed to filter movies.");
            } finally {
                setLoading(false);
            }
        };
        runDiscover();
    }, [selectedGenreId, selectedYear, selectedCountry]);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) {
            setError("Please enter a search term.");
            return;
        }
        // Searching resets filters — TMDB search doesn't combine with discover filters
        setSelectedGenreId("");
        setSelectedYear("All");
        setSelectedCountry("");

        setLoading(true);
        setError(null);
        try {
            const results = await searchMovies(searchQuery);
            setMovies(results);
        } catch (err) {
            setError("Failed to search movies.");
        } finally {
            setLoading(false);
        }
    };

    const clearFilters = () => {
        setSelectedGenreId("");
        setSelectedYear("All");
        setSelectedCountry("");
    };

    const hasActiveFilters = selectedGenreId !== "" || selectedYear !== "All" || selectedCountry !== "";

    return (
        <div className="home">

            {/* ── Search bar — its own form ── */}
            <form onSubmit={handleSearch} className="search-form">
                <input
                    type="text"
                    placeholder="Search movies..."
                    className="search-input"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit" className="search-button">Search</button>
                <button
                    type="button"
                    className={`filter-toggle-btn ${showFilters ? "active" : ""} ${hasActiveFilters ? "has-filters" : ""}`}
                    onClick={() => setShowFilters(prev => !prev)}
                >
                    ⚙️ {hasActiveFilters ? "Filtered" : "Filter"}
                </button>
            </form>

            {/* ── Filter panel — OUTSIDE the form ── */}
            {showFilters && (
                <div className="filter-panel">
                    <div className="filter-group">
                        <label>Genre</label>
                        <div className="filter-chips">
                            {genres.map(g => (
                                <button
                                    type="button"
                                    key={g.id || "all"}
                                    className={`chip ${selectedGenreId === g.id ? "active" : ""}`}
                                    onClick={() => setSelectedGenreId(g.id)}
                                >{g.name}</button>
                            ))}
                        </div>
                    </div>
                    <div className="filter-group">
                        <label>Year</label>
                        <div className="filter-chips">
                            {YEARS.map(y => (
                                <button
                                    type="button"
                                    key={y}
                                    className={`chip ${selectedYear === y ? "active" : ""}`}
                                    onClick={() => setSelectedYear(y)}
                                >{y}</button>
                            ))}
                        </div>
                    </div>
                    <div className="filter-group">
                        <label>Country</label>
                        <div className="filter-chips">
                            {COUNTRIES.map(c => (
                                <button
                                    type="button"
                                    key={c.code || "all"}
                                    className={`chip ${selectedCountry === c.code ? "active" : ""}`}
                                    onClick={() => setSelectedCountry(c.code)}
                                >{c.label}</button>
                            ))}
                        </div>
                    </div>
                    {hasActiveFilters && (
                        <button type="button" className="clear-filters-btn" onClick={clearFilters}>
                            ✕ Clear Filters
                        </button>
                    )}
                </div>
            )}

            {/* ── Results ── */}
            {loading ? (
                <p className="loading-text">Loading...</p>
            ) : error ? (
                <p className="error-message">{error}</p>
            ) : (
                <>
                    {hasActiveFilters && (
                        <p className="filter-results-count">
                            Showing {movies.length} movies
                        </p>
                    )}
                    <div className="movie-grid">
                        {movies.map((movie) => (
                            <MovieCard movie={movie} key={movie.imdbID} />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

export default Home;