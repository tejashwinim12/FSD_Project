import { useState, useEffect } from "react";
import Login from "./Login";
import Register from "./Register";
import MovieCard from "../components/MovieCard";
import { searchMovies, getPopularMovies, getMoviesByGenre } from "../services/api";
import "../css/Home.css";

export default function Home() {
  const [showRegister, setShowRegister] = useState(false);
  const token = localStorage.getItem("token");
  const [searchQuery, setSearchQuery] = useState("");
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedMovie, setSelectedMovie] = useState(null);
  const [recommendedMovies, setRecommendedMovies] = useState([]);

  // Load popular movies after login
  useEffect(() => {
    if (!token) return;

    const loadPopularMovies = async () => {
      try {
        const popularMovies = await getPopularMovies();
        setMovies(popularMovies);
        setError(null);
      } catch (err) {
        console.log(err);
        setError("Failed to load movies...");
      } finally {
        setLoading(false);
      }
    };

    loadPopularMovies();
  }, [token]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const searchResults = await searchMovies(searchQuery);
      setMovies(searchResults);
      setSelectedMovie(null);
      setRecommendedMovies([]);
      setError(null);
    } catch (err) {
      console.log(err);
      setError("Failed to search movies...");
    } finally {
      setLoading(false);
    }
  };

  const handleMovieClick = async (movie) => {
    setSelectedMovie(movie);

    if (movie.genre_ids && movie.genre_ids.length > 0) {
      const genreId = movie.genre_ids[0]; // pick first genre
      try {
        const recs = await getMoviesByGenre(genreId, 5);
        const filtered = recs.filter((m) => m.id !== movie.id).slice(0, 30);
        setRecommendedMovies(filtered);
      } catch (err) {
        console.log("Failed to fetch recommendations", err);
        setRecommendedMovies([]);
      }
    } else {
      setRecommendedMovies([]);
    }
  };

  // Conditional Rendering for login/register
  if (!token) {
    return !showRegister ? (
      <Login toggleRegister={() => setShowRegister(true)} />
    ) : (
      <Register toggleLogin={() => setShowRegister(false)} />
    );
  }

  return (
    <div className="home">
      {/* Search Form */}
      <form onSubmit={handleSearch} className="search-form">
        <div className="input-wrapper">
          <input
            type="text"
            placeholder="Search for movies..."
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="clear-btn"
              onClick={async () => {
                setSearchQuery("");
                setLoading(true);
                try {
                  const popularMovies = await getPopularMovies();
                  setMovies(popularMovies);
                  setSelectedMovie(null);
                  setRecommendedMovies([]);
                  setError(null);
                } catch (err) {
                  setError("Failed to load movies...");
                } finally {
                  setLoading(false);
                }
              }}
            >
              ✕
            </button>
          )}
        </div>
        <button type="submit" className="search-button">
          Search
        </button>
      </form>

      {error && <div className="error-message">{error}</div>}

      {/* Loading / Movie Grid */}
      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <div className="movies-grid">
          {movies.map((movie) => (
            <div
              key={movie.id}
              onClick={() => handleMovieClick(movie)}
              style={{ cursor: "pointer" }}
            >
              <MovieCard movie={movie} />
            </div>
          ))}
        </div>
      )}

      {/* Recommended Movies Section */}
      {selectedMovie && recommendedMovies.length > 0 && (
        <div className="recommended-section">
          <h2>Recommended for you</h2>
          <div className="movies-grid">
            {recommendedMovies.map((movie) => (
              <div
                key={movie.id}
                onClick={() => handleMovieClick(movie)}
                style={{ cursor: "pointer" }}
              >
                <MovieCard movie={movie} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
