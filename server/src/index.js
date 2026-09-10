import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import api from "./routes/api.js";
import auth from "./routes/auth.js";
import { ensureUsersTable } from "./auth.js";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 5001;
const CLIENT_ORIGINS = (
  process.env.CLIENT_ORIGIN ||
  "http://localhost:5173,http://localhost:5174,https://glasssteel.in,https://www.glasssteel.in"
).split(",").map((s) => s.trim());

app.set("trust proxy", 1);

app.use(
  cors({
    origin: CLIENT_ORIGINS,
  })
);
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "glassteel-api" });
});

app.use("/api/auth", auth);
app.use("/api", api);

ensureUsersTable().catch((err) => {
  console.error("Failed to ensure users table:", err.message);
});

const clientDist = path.join(__dirname, "../../client/dist");
app.use(express.static(clientDist));
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api")) return next();
  res.sendFile(path.join(clientDist, "index.html"), (err) => {
    if (err) next();
  });
});

app.listen(PORT, () => {
  console.log(`GLASSTEEL API running on http://localhost:${PORT}`);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught exception:", err);
});

process.on("unhandledRejection", (err) => {
  console.error("Unhandled rejection:", err);
});
