// api.js
const API_KEY = "b7af47a7418e730f0723ebcb63cfde12";
const BASE_URL = "https://api.themoviedb.org/3";
const API_BASE = "http://localhost:5000/api"; // your backend base URL

// --------------------
// TMDB Calls
// --------------------
export const getPopularMovies = async () => {
  const response = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}`);
  const data = await response.json();
  return formatMovies(data.results); 
};

export const searchMovies = async (query) => {
  const response = await fetch(
    `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}`
  );
  const data = await response.json();
  return formatMovies(data.results);
};

export const getMoviesByGenre = async (genreId, pages = 3) => {
  let allMovies = [];
  for (let page = 1; page <= pages; page++) {
    const response = await fetch(
      `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${genreId}&page=${page}`
    );
    const data = await response.json();
    allMovies = allMovies.concat(formatMovies(data.results));
  }
  return allMovies;
};

// --------------------
// TMDB Helper
// --------------------
export const genreMap = {
  28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy", 80: "Crime",
  99: "Documentary", 18: "Drama", 10751: "Family", 14: "Fantasy", 36: "History",
  27: "Horror", 10402: "Music", 9648: "Mystery", 10749: "Romance", 878: "Science Fiction",
  10770: "TV Movie", 53: "Thriller", 10752: "War", 37: "Western"
};

const formatMovies = (movies) =>
  movies.map(movie => ({
    ...movie,
    genres: movie.genre_ids.map(id => genreMap[id] || "Unknown")
  }));

// --------------------
// Backend Protected Fetch
// --------------------

// Helper to get auth header
const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Use this for requests to your backend that require JWT
export async function fetchProtected(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...getAuthHeader(),
    ...(options.headers || {})
  };
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (res.status === 401) {
    // auto-logout on unauthorized
    localStorage.removeItem("token");
    window.location.href = "/login"; // optional redirect
  }
  return res;
}
