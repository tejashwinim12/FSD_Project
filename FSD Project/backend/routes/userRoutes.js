// userRoutes.js
import express from "express";
import authMiddleware from "../middleware/authMiddleware.js"; // JWT middleware
import { db } from "../config/db.js";

const router = express.Router();

// ==========================
// GET user profile
// ==========================
router.get("/profile", authMiddleware, (req, res) => {
  db.query(
    "SELECT id, name, email FROM users WHERE id = ?",
    [req.userId],
    (err, results) => {
      if (err)
        return res
          .status(500)
          .json({ message: "Database error", error: err });
      if (results.length === 0)
        return res.status(404).json({ message: "User not found" });
      res.json(results[0]);
    }
  );
});

// ==========================
// UPDATE user profile
// ==========================
router.put("/profile", authMiddleware, (req, res) => {
  const { name, email } = req.body;

  if (!name || !email)
    return res.status(400).json({ message: "All fields are required" });

  db.query(
    "UPDATE users SET name = ?, email = ? WHERE id = ?",
    [name, email, req.userId],
    (err) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY")
          return res.status(400).json({ message: "Email already exists" });
        return res
          .status(500)
          .json({ message: "Database error", error: err });
      }

      // Return updated user
      db.query(
        "SELECT id, name, email FROM users WHERE id = ?",
        [req.userId],
        (err, results) => {
          if (err)
            return res
              .status(500)
              .json({ message: "Database error", error: err });
          res.json(results[0]);
        }
      );
    }
  );
});

export default router;
