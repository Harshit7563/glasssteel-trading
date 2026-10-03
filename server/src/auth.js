import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { query } from "./db/pool.js";

const JWT_SECRET = process.env.JWT_SECRET || "glassteel-dev-secret-change-me";
const JWT_DAYS = process.env.JWT_DAYS || "7d";

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "admin@glasssteel.in").toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Admin@GlassSteel2026";
const ADMIN_NAME = process.env.ADMIN_NAME || "GlassSteel Admin";

export async function ensureUsersTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'customer',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'customer'`);
  await ensureAdminUser();
}

export async function ensureAdminUser() {
  const existing = await query(`SELECT id FROM users WHERE email = $1`, [ADMIN_EMAIL]);
  if (existing.rows[0]) {
    await query(`UPDATE users SET role = 'admin' WHERE email = $1`, [ADMIN_EMAIL]);
    return;
  }

  const password_hash = await hashPassword(ADMIN_PASSWORD);
  await query(
    `INSERT INTO users (name, email, phone, password_hash, role)
     VALUES ($1, $2, NULL, $3, 'admin')`,
    [ADMIN_NAME, ADMIN_EMAIL, password_hash]
  );
}

export function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name, role: user.role || "customer" },
    JWT_SECRET,
    { expiresIn: JWT_DAYS }
  );
}

export function publicUser(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    role: row.role || "customer",
    created_at: row.created_at,
  };
}

export async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

export function authRequired(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ error: "Login required" });
  }
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired session" });
  }
}

export function adminRequired(req, res, next) {
  authRequired(req, res, () => {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }
    next();
  });
}

export function optionalAuth(req, _res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (token) {
    try {
      req.user = jwt.verify(token, JWT_SECRET);
    } catch {
      req.user = null;
    }
  }
  next();
}
