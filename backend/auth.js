import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "./db.js";

const router = express.Router();

// ============================
// REGISTER USER
// ============================
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // check if email already exists
    const existing = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: "Email already registered" });
    }

    // hash password
    const hashedPassword = bcrypt.hashSync(password, 10);

    // insert user (role defaults to customer unless provided as admin)
    const result = await pool.query(
      `INSERT INTO users (name, email, password, role)
       VALUES ($1,$2,$3,$4)
       RETURNING id, name, email, role`,
      [name, email, hashedPassword, role || "customer"]
    );

    res.json({ success: true, user: result.rows[0] });
  } catch (err) {
    console.error("❌ Registration error:", err);
    res.status(500).json({ error: "Failed to register user" });
  }
});

// ============================
// LOGIN USER
// ============================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    const user = result.rows[0];

    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const match = bcrypt.compareSync(password, user.password);
    if (!match) return res.status(401).json({ error: "Invalid credentials" });

    // generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "supersecret",
      { expiresIn: "1d" }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ error: "Failed to login" });
  }
});

export default router;