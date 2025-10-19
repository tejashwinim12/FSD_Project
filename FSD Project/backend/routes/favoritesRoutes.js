// routes/favoritesRoutes.js
import express from "express";
import { db } from "../config/db.js";
import authMiddleware from "../middleware/authMiddleware.js";
import axios from "axios";

const router = express.Router();
const TMDB_KEY = process.env.TMDB_API_KEY;
const TMDB_API_BASE = "https://api.themoviedb.org/3";

// Get user's favorites
router.get("/favorites", authMiddleware, (req, res) => {
  const userId = req.userId;
  db.query("SELECT movie_json FROM favorites WHERE user_id = ?", [userId], (err, results) => {
    if (err) return res.status(500).json({ message: "DB error", error: err });
    const movies = results.map(r => JSON.parse(r.movie_json));
    res.json(movies);
  });
});

// Add favorite
router.post("/favorites", authMiddleware, (req, res) => {
  const userId = req.userId;
  const movie = req.body.movie;
  if (!movie || !movie.id) return res.status(400).json({ message: "movie required" });

  const movieId = movie.id;
  const movieJsonStr = JSON.stringify(movie);

  const sql = "INSERT INTO favorites (user_id, movie_id, movie_json) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE movie_json = ?";
  db.query(sql, [userId, movieId, movieJsonStr, movieJsonStr], (err, result) => {
    if (err) return res.status(500).json({ message: "DB error", error: err });
    res.status(201).json({ message: "Added to favorites", movie });
  });
});

// Remove favorite
router.delete("/favorites/:movieId", authMiddleware, (req, res) => {
  const userId = req.userId;
  const movieId = parseInt(req.params.movieId, 10);
  db.query("DELETE FROM favorites WHERE user_id = ? AND movie_id = ?", [userId, movieId], (err, result) => {
    if (err) return res.status(500).json({ message: "DB error", error: err });
    res.json({ message: "Removed from favorites" });
  });
});

// Recommendations endpoint (content-based using top genres)
router.get("/recommendations", authMiddleware, async (req, res) => {
  const userId = req.userId;

  // 1) get user's favorite movie JSONs from DB
  db.query("SELECT movie_json, movie_id FROM favorites WHERE user_id = ?", [userId], async (err, results) => {
    if (err) return res.status(500).json({ message: "DB error", error: err });

    if (!results || results.length === 0) {
      // No favorites: fallback to TMDB popular
      try {
        const pop = await axios.get(`${TMDB_API_BASE}/movie/popular`, { params: { api_key: TMDB_KEY, language: "en-US", page: 1 } });
        return res.json(pop.data.results.slice(0, 20));
      } catch (tmErr) {
        return res.status(500).json({ message: "TMDB error", error: tmErr.message });
      }
    }

    // 2) collect genre ids frequency across favorites
    const genreCount = {};
    const favoritedIds = [];
    for (const r of results) {
      const movie = typeof r.movie_json === "string" ? JSON.parse(r.movie_json) : r.movie_json;
      favoritedIds.push(r.movie_id);
      if (movie.genre_ids && Array.isArray(movie.genre_ids)) {
        movie.genre_ids.forEach(g => {
          genreCount[g] = (genreCount[g] || 0) + 1;
        });
      } else if (movie.genres && Array.isArray(movie.genres)) {
        movie.genres.forEach(g => {
          const id = g.id;
          genreCount[id] = (genreCount[id] || 0) + 1;
        });
      }
    }

    // pick top 3 genres
    const topGenres = Object.entries(genreCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([id]) => id)
      .join(",");

    // 3) call TMDB discover to get movies in these genres, exclude already favorited
    try {
      const discoverRes = await axios.get(`${TMDB_API_BASE}/discover/movie`, {
        params: {
          api_key: TMDB_KEY,
          with_genres: topGenres,
          sort_by: "popularity.desc",
          page: 1,
          language: "en-US",
        },
      });

      let candidates = discoverRes.data.results || [];
      // filter out favorited
      candidates = candidates.filter(c => !favoritedIds.includes(c.id)).slice(0, 20);

      res.json(candidates);
    } catch (tmErr) {
      console.error("TMDB discover error", tmErr.message);
      return res.status(500).json({ message: "TMDB error", error: tmErr.message });
    }
  });
});

export default router;
