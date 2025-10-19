import { getUserById } from "../models/userModel.js";

export const getProfile = (req, res) => {
  const userId = req.user.id;
  getUserById(userId, (err, results) => {
    if (err) return res.status(500).json({ message: "Database error" });
    if (results.length === 0) return res.status(404).json({ message: "User not found" });
    res.json(results[0]);
  });
};
