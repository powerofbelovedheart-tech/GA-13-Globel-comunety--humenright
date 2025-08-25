// routes/auth.js
const express = require("express");
const router = express.Router();
const requireAuth = require("../middleware/requireAuth");

// Registrer (stub)
router.post("/register", (req, res) => {
  res.json({ ok: true, message: "register OK (stub)" });
});

// Logg inn (stub)
router.post("/login", (req, res) => {
  res.json({ ok: true, token: "demo-token", message: "login OK (stub)" });
});

// Hent meg (stub)
router.get("/me", requireAuth, (req, res) => {
  res.json({ ok: true, user: { id: "123", email: "demo@ga13.local" } });
});

// Logg ut (stub)
router.post("/logout", requireAuth, (req, res) => {
  res.json({ ok: true, message: "logout OK (stub)" });
});

module.exports = router;