const TMDB_TOKEN = import.meta.env.VITE_TMDB_TOKEN;
const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE = "https://image.tmdb.org/t/p/w500";

// Shared headers for every TMDB request — uses the v4 Bearer token
const headers = {
  Authorization: `Bearer ${TMDB_TOKEN}`,
  accept: "application/json",
};

// Helper — converts a raw TMDB movie object into the shape your
// existing components (MovieCard, Moviecontext, etc.) expect.
// This keeps the rest of your app unchanged — only api.js knows about TMDB.
function normalizeMovie(movie) {
  return {
    imdbID: String(movie.id),                 // TMDB uses numeric `id`, not imdbID
    Title: movie.title,
    Poster: movie.poster_path
      ? `${IMAGE_BASE}${movie.poster_path}`
      : "fallback-image-url.png",
    Year: movie.release_date ? movie.release_date.split("-")[0] : "N/A",
    Genre: movie.genre_ids ? movie.genre_ids.join(",") : (movie.genres ? movie.genres.map(g => g.name).join(", ") : ""),
    Plot: movie.overview,
    imdbRating: movie.vote_average ? movie.vote_average.toFixed(1) : "N/A",
    Country: movie.origin_country ? movie.origin_country.join(", ") : "",
    Released: movie.release_date,
    // Keep raw fields too, in case you need them later (cast, runtime, etc.)
    _raw: movie,
  };
}

// 1. Popular movies for the homepage (replaces the old random-keyword OMDb hack)
export const getPopularMovies = async () => {
  const response = await fetch(`${BASE_URL}/movie/popular?language=en-US&page=1`, { headers });
  const data = await response.json();
  return (data.results || []).map(normalizeMovie);
};

// 2. Search movies by title
export const searchMovies = async (query) => {
  const response = await fetch(
    `${BASE_URL}/search/movie?query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=1`,
    { headers }
  );
  const data = await response.json();
  return (data.results || []).map(normalizeMovie);
};

// 3. Full details for a single movie (cast, genres, runtime etc.)
export const getMovieDetails = async (tmdbId) => {
  const response = await fetch(`${BASE_URL}/movie/${tmdbId}?language=en-US`, { headers });
  const data = await response.json();
  return normalizeMovie(data);
};

// 4. Discover — TMDB's server-side filtering endpoint.
// This replaces your old client-side filter hack entirely.
// filters: { genreId, year, country }
export const discoverMovies = async (filters = {}) => {
  const params = new URLSearchParams({
    include_adult: "false",
    language: "en-US",
    sort_by: "popularity.desc",
    page: "1",
  });

  if (filters.genreId) params.append("with_genres", filters.genreId);
  if (filters.year) params.append("primary_release_year", filters.year);
  if (filters.country) params.append("with_origin_country", filters.country);

  const response = await fetch(`${BASE_URL}/discover/movie?${params.toString()}`, { headers });
  const data = await response.json();
  return (data.results || []).map(normalizeMovie);
};

// 5. Get the genre list TMDB uses — needed to map genre names <-> genre IDs for filters
export const getGenreList = async () => {
  const response = await fetch(`${BASE_URL}/genre/movie/list?language=en-US`, { headers });
  const data = await response.json();
  return data.genres || []; // [{ id: 28, name: "Action" }, ...]
};