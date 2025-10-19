import { createUser, getUserByEmail } from "../models/userModel.js";
import generateToken from "../utils/generateToken.js";
import bcrypt from "bcrypt";
import {db} from "../config/db.js";

export const registerUser = (req, res) => {
  const { name, email, password } = req.body;
  getUserByEmail(email, (err, results) => {
    if (err) return res.status(500).json({ message: "Database error" });
    if (results.length > 0) return res.status(400).json({ message: "User already exists" });

    createUser(name, email, password, (err, result) => {
      if (err) return res.status(500).json({ message: "Error creating user" });
      const userId = result.insertId;
      res.status(201).json({
        id: userId,
        name,
        email,
        token: generateToken(userId)
      });
    });
  });
};

export const loginUser = (req, res) => {
  const { email, password } = req.body;
  getUserByEmail(email, (err, results) => {
    if (err) return res.status(500).json({ message: "Database error" });
    if (results.length === 0) return res.status(400).json({ message: "Invalid credentials" });

    const user = results[0];
    if (!bcrypt.compareSync(password, user.password)) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      token: generateToken(user.id)
    });
  });
};

export const deleteUser = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "User not found or not logged in" });
    }

    await User.findByIdAndDelete(req.user._id); // Use _id from req.user

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error deleting user" });
  }
};



