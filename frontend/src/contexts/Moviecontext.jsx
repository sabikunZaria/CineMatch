import {createContext, useState, useContext, useEffect} from "react";

const MovieContext = createContext();

export const MovieProvider = ({children}) => {
    const [favourites, setFavourites] = useState([])

useEffect(() => {
    const storedFavourites = localStorage.getItem('favourites');
    if (storedFavourites) {
        setFavourites(JSON.parse(storedFavourites));
    }
}, [])

useEffect(() => {
    localStorage.setItem('favourites', JSON.stringify(favourites));
}, [favourites])

    const addToFavourites = (movie) => {
        if (!favourites.some(fav => fav.imdbID === movie.imdbID)) {
            setFavourites(prev => [...prev, movie]);
        }
    }   
    const removeFromFavourites = (movieimdbID) => {
        setFavourites(prev => prev.filter(movie => movie.imdbID !== movieimdbID));
    }   
    const isFavourite = (movieimdbID) => {
        return favourites.some(movie => movie.imdbID === movieimdbID);
    }   
    const value = {
        favourites,
        addToFavourites,    
        removeFromFavourites,
        isFavourite
    };
    return <MovieContext.Provider value={value}>
        {children}
    </MovieContext.Provider>
}
// Add this right below your MovieProvider component
export const useMoviecontext = () => {
    const context = useContext(MovieContext);
    if (!context) {
        throw new Error("useMoviecontext must be used within a MovieProvider");
    }
    return context;
};