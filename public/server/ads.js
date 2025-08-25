// routes/auth.js
const express = require("express");
const router = express.Router();
const requireAuth = require("../middleware/requireAuth");

// registrer (stub)
router.post("/register", (req, res) => {
  res.json({ ok: true, message: "register OK (stub)" });
});

// logg inn (stub)
router.post("/login", (req, res) => {
  res.json({ ok: true, token: "demo-token", message: "login OK (stub)" });
});

// hent meg (stub + requireAuth)
router.get("/me", requireAuth, (req, res) => {
  res.json({ ok: true, user: { id: "u_123", email: "demo@ga13.local" } });
});

// logg ut (stub)
router.post("/logout", requireAuth, (req, res) => {
  res.json({ ok: true, message: "logout OK (stub)" });
});

module.exports = router;