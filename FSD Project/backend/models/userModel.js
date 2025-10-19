import { db } from "../config/db.js";
import bcrypt from "bcryptjs";

export const createUser = (name, email, password, callback) => {
  const hashedPassword = bcrypt.hashSync(password, 10);
  db.query(
    "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
    [name, email, hashedPassword],
    callback
  );
};

export const getUserByEmail = (email, callback) => {
  db.query("SELECT * FROM users WHERE email = ?", [email], callback);
};

export const getUserById = (id, callback) => {
  db.query("SELECT id, name, email FROM users WHERE id = ?", [id], callback);
};
