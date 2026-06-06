import '../css/MovieCard.css'
import {useMoviecontext} from '../contexts/Moviecontext'
function MovieCard({ movie }) {

const {addToFavourites, removeFromFavourites, isFavourite} = useMoviecontext();

function onFavouriteClick(e) {
    e.preventDefault();
    if (isFavourite(movie.imdbID)) {
        removeFromFavourites(movie.imdbID);
    } else {
        addToFavourites(movie);
    }
}


    return <div className="movie-card">
        <div className="movie-poster">
        <img 
        src={movie.Poster !== "N/A" ? movie.Poster : "fallback-image-url.png"} 
        alt={movie.Title} 
        />            <div className="movie-overlay">
                <button className={`favourite-btn ${isFavourite(movie.imdbID) ? "active" : ""}`} onClick={onFavouriteClick}>
                    ❤️
                </button>
            </div>
        </div>

        <div className="movie-info">
            <h3>{movie.Title}</h3>
            <p>{movie.Released}</p>
        </div>
    </div>
}

export default MovieCard;