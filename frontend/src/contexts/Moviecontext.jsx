import { createContext, useState, useContext, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "./Authcontext";

const MovieContext = createContext();

export const MovieProvider = ({ children }) => {
    const [favourites, setFavourites] = useState([]);
    const { user, loading } = useAuth();      // ← pull loading too

    useEffect(() => {
        if (loading) return;                  // ← wait until auth is ready

        if (user) {
            loadFavourites();
        } else {
            setFavourites([]);
        }
    }, [user, loading]);                      // ← watch both

    const loadFavourites = async () => {
        const { data, error } = await supabase
            .from("favorites")
            .select("*")
            .eq("user_id", user.id);

        if (error) {
            console.error("Error loading favourites:", error.message);
            return;
        }

        setFavourites(data.map(row => ({
            imdbID: row.movie_id,
            Title: row.title,
            Poster: row.poster,
        })));
    };

    const addToFavourites = async (movie) => {
        if (!user) return;
        if (isFavourite(movie.imdbID)) return;

        setFavourites(prev => [...prev, movie]);

        const { error } = await supabase
            .from("favorites")
            .insert({
                user_id: user.id,
                movie_id: movie.imdbID,
                title: movie.Title,
                poster: movie.Poster,
            });

        if (error) {
            console.error("Error adding favourite:", error.message);
            setFavourites(prev => prev.filter(m => m.imdbID !== movie.imdbID));
        }
    };

    const removeFromFavourites = async (movieImdbID) => {
        if (!user) return;

        setFavourites(prev => prev.filter(m => m.imdbID !== movieImdbID));

        const { error } = await supabase
            .from("favorites")
            .delete()
            .eq("user_id", user.id)
            .eq("movie_id", movieImdbID);

        if (error) {
            console.error("Error removing favourite:", error.message);
            loadFavourites();
        }
    };

    const isFavourite = (movieImdbID) => {
        return favourites.some(movie => movie.imdbID === movieImdbID);
    };

    const value = {
        favourites,
        addToFavourites,
        removeFromFavourites,
        isFavourite,
    };

    return (
        <MovieContext.Provider value={value}>
            {children}
        </MovieContext.Provider>
    );
};

export const useMoviecontext = () => {
    const context = useContext(MovieContext);
    if (!context) {
        throw new Error("useMoviecontext must be used within a MovieProvider");
    }
    return context;
};