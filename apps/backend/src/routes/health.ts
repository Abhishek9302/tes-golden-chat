import { Router } from "express";
import pool from "../db";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const r = await pool.query("SELECT 1");
    res.json({ status: "ok", db: r.rows.length === 1 ? "up" : "down" });
  } catch {
    res.status(503).json({ status: "error", db: "down" });
  }
});

export default router;
