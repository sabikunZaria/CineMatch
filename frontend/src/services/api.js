const API_KEY = '5c847102';
const BASE_URL = 'https://www.omdbapi.com/';

export const getPopularMovies = async () => {

    // A list of general keywords that return wide varieties of movies
    const coolKeywords = ['space', 'dark', 'justice', 'world', 'star', 'dead', 'history', 'hunter', 'game'];
    
    // Pick one keyword randomly on every page refresh
    const randomKeyword = coolKeywords[Math.floor(Math.random() * coolKeywords.length)];

    const response = await fetch(`${BASE_URL}?s=${randomKeyword}&type=movie&apikey=${API_KEY}`);
    const data = await response.json();
    
    return data.Search || []; 
};

// 2. Search for movies based on what the user types
export const searchMovies = async (query) => {
    const response = await fetch(`${BASE_URL}?s=${encodeURIComponent(query)}&apikey=${API_KEY}`);
    const data = await response.json();
    
    // Again, return the "Search" array, or an empty array if nothing is found
    return data.Search || [];
};