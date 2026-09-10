import { Router } from "express";
import {
  authRequired,
  ensureUsersTable,
  hashPassword,
  publicUser,
  signToken,
  verifyPassword,
} from "../auth.js";
import { query } from "../db/pool.js";

const router = Router();

router.post("/register", async (req, res) => {
  try {
    await ensureUsersTable();
    const { name, email, phone, password } = req.body || {};

    if (!name?.trim() || !email?.trim() || !password) {
      return res
        .status(400)
        .json({ error: "Name, email, and password are required" });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters" });
    }

    const emailNorm = email.trim().toLowerCase();
    const existing = await query(`SELECT id FROM users WHERE email = $1`, [
      emailNorm,
    ]);
    if (existing.rows[0]) {
      return res.status(409).json({ error: "Email already registered. Please login." });
    }

    const password_hash = await hashPassword(password);
    const { rows } = await query(
      `INSERT INTO users (name, email, phone, password_hash)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, phone, created_at`,
      [name.trim(), emailNorm, phone?.trim() || null, password_hash]
    );

    const user = publicUser(rows[0]);
    const token = signToken(user);
    res.status(201).json({ user, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Registration failed" });
  }
});

router.post("/login", async (req, res) => {
  try {
    await ensureUsersTable();
    const { email, password } = req.body || {};

    if (!email?.trim() || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const { rows } = await query(
      `SELECT id, name, email, phone, password_hash, created_at
       FROM users WHERE email = $1`,
      [email.trim().toLowerCase()]
    );

    if (!rows[0]) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const ok = await verifyPassword(password, rows[0].password_hash);
    if (!ok) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const user = publicUser(rows[0]);
    const token = signToken(user);
    res.json({ user, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Login failed" });
  }
});

router.get("/me", authRequired, async (req, res) => {
  try {
    await ensureUsersTable();
    const { rows } = await query(
      `SELECT id, name, email, phone, created_at FROM users WHERE id = $1`,
      [req.user.id]
    );
    if (!rows[0]) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ user: publicUser(rows[0]) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load profile" });
  }
});

export default router;
