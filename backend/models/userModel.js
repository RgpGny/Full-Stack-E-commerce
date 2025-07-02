import { db } from "../config/db.js";

export const findUserByEmail = async (email) => {
  const result = await db.query("SELECT * FROM users WHERE email=$1", [email]);
  return result.rows[0];
};

export const createUser = async (userData) => {
  const { username, email, hashedPassword } = userData;
  const result = await db.query(
    "INSERT INTO users (username,email,password) VALUES ($1,$2,$3) RETURNING *",
    [username, email, hashedPassword]
  );
  return result.rows[0];
};

export const findUserById = async (id) => {
  const result = await db.query("SELECT * FROM users WHERE id=$1", [id]);
  return result.rows[0];
};
