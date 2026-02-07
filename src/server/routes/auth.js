const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { db } = require("../db/db");

const router = express.Router();

function signToken(payload) {
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN || "7d";
  return jwt.sign(payload, secret, { expiresIn });
}

// POST /api/auth/register
router.post("/register", (req, res) => {
  const email = (req.body.email ?? "").trim().toLowerCase();
  const password = (req.body.password ?? "").trim();

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters." });
  }

  const passwordHash = bcrypt.hashSync(password, 10);

  db.run(
    `INSERT INTO users (email, password_hash) VALUES (?, ?)`,
    [email, passwordHash],
    function (err) {
      if (err) {
        // UNIQUE constraint (email)
        if (String(err.message).includes("UNIQUE")) {
          return res.status(409).json({ error: "Email already registered." });
        }
        return res.status(500).json({ error: err.message });
      }

      const userId = this.lastID;
      const token = signToken({ userId });

      return res.status(201).json({
        user: { id: userId, email },
        token,
      });
    }
  );
});

// POST /api/auth/login
router.post("/login", (req, res) => {
  const email = (req.body.email ?? "").trim().toLowerCase();
  const password = (req.body.password ?? "").trim();

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  db.get(
    `SELECT id, email, password_hash FROM users WHERE email = ?`,
    [email],
    (err, user) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!user) return res.status(401).json({ error: "Invalid email or password." });

      const ok = bcrypt.compareSync(password, user.password_hash);
      if (!ok) return res.status(401).json({ error: "Invalid email or password." });

      const token = signToken({ userId: user.id });
      return res.json({
        user: { id: user.id, email: user.email },
        token,
      });
    }
  );
});

module.exports = router;
