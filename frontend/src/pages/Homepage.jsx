import MovieCard from "../components/MovieCard";
import { useState, useEffect } from "react";
import { searchMovies, getPopularMovies } from "../services/api";   
import '../css/Home.css';

function Home() {
    const [searchQuery, setSearchQuery] = useState("");
    const [movies, setMovies] = useState([]);
    // Fixed casing here to match standard conventions
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadPopularMovies = async () => {
            try {
                const popularMovies = await getPopularMovies();
                setMovies(popularMovies);
            } catch (error) {
                console.error("Error fetching popular movies:", error);
                setError("Failed to load movies.");
            } finally {
                setLoading(false);
            }
        };
        loadPopularMovies();
    }, []);

    const handleSearch = async (e) => {
        e.preventDefault();
        
        if (!searchQuery.trim()) {
            setError("Please enter a search term.");
            return;
        }

        setLoading(true);
        // Clear any old error state when beginning a new search
        setError(null); 

        try {
            const searchResults = await searchMovies(searchQuery);
            setMovies(searchResults);
            
            // If you want to clear the search bar after a successful search, do it here:
            // setSearchQuery(""); 
        } catch (error) {
            console.error("Error searching movies:", error);
            setError("Failed to search movies.");
        } finally {
            setLoading(false);
        }
        
        // REMOVED: The duplicate searchMovies(searchQuery).then(...) call was deleted 
        // to prevent making two redundant API calls back-to-back.
    };

    return (
        <div className="home">
            <form onSubmit={handleSearch} className="search-form">
                <input 
                    type="text" 
                    placeholder="Search movies..." 
                    className="search-input" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit" className="search-button">Search</button>
            </form>

            {loading ? (
                <p>Loading...</p>
            ) : error ? (
                <p className="error-message">{error}</p>
            ) : (
                <div className="movie-grid">
                    {movies?.map((movie) => (
                        <MovieCard movie={movie} key={movie.imdbID} />
                    ))}
                </div>
            )}    
        </div>
    );
}

export default Home;