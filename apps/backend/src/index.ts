import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs/promises";
import path from "path";
import pool from "./db";
import healthRouter from "./routes/health";
import authRouter from "./routes/auth";
import chatRouter from "./routes/chat";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || "8080");

const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins.length ? allowedOrigins : true,
    credentials: true
  })
);
app.use(express.json());

app.use("/", healthRouter);
app.use("/api/auth", authRouter);
app.use("/api/chat", chatRouter);

async function initSchema() {
  const candidates = [
    path.join(__dirname, "../../database/schema.sql"),
    path.join(__dirname, "../../../database/schema.sql"),
    path.join(process.cwd(), "database/schema.sql")
  ];

  for (const p of candidates) {
    try {
      const sql = await fs.readFile(p, "utf8");
      await pool.query(sql);
      console.log("schema applied from", p);
      return;
    } catch (e: any) {
      if (e.code !== "ENOENT") {
        console.error("schema error", e);
        throw e;
      }
    }
  }

  throw new Error("schema.sql not found");
}

initSchema()
  .then(() => {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`listening on 0.0.0.0:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("failed to initialize", err);
    process.exit(1);
  });
