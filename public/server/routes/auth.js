// server/routes/auth.js
const express = require("express");
const router = express.Router();

// Enkel GET som svarer "OK"
router.get("/", (req, res) => {
  res.json({ message: "Auth route fungerer!" });
});

// Eksporter router
module.exports = router;