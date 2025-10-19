// server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import rateLimit from "express-rate-limit"; // <-- import
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js"; // optional
import { connectDB } from "./config/db.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MySQL
connectDB();

// ----------------------
// RATE LIMITING
// ----------------------
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per window
  message: "Too many requests from this IP, please try again later",
});
app.use(limiter); // Apply to all requests

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);     // /register, /login
app.use("/api/users", userRoutes);    // /profile, /delete (if separate)

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
