import "../css/Favourite.css";
import "../css/home.css";
import { useMoviecontext } from "../contexts/Moviecontext";
import MovieCard from "../components/MovieCard";

function Favourites() {
  const { favourites } = useMoviecontext();

  if (favourites) {
    return (
     <div className="favourites-page">
            <h2 className="page-title">My Favourite Movies</h2>

            {favourites.length === 0 ? (
                <div className="empty-favourites">
                    <p>No favourite movies added yet. Go back to Home to add some! ❤️</p>
                </div>
            ) : (
                /* CRUCIAL FIX: This wrapper div must have className="movie-grid" */
                <div className="movie-grid">
                    {favourites.map((movie) => (
                        <MovieCard movie={movie} key={movie.imdbID} />
                    ))}
                </div>
            )}
        </div>
    );
  }

  return (
    <div className="favourites-empty">
      <h2>No Favorite Movies Yet</h2>
      <p>Start adding movies to your favorites and they will appear here!</p>
    </div>
  );
}

export default Favourites;