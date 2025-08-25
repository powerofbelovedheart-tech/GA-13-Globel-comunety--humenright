// server.js
const express = require("express");
const path = require("path");
const cors = require("cors");
const morgan = require("morgan");
require("dotenv").config();

const app = express();

// ---- config
const PORT = Number(process.env.PORT || 5000);

// ---- middleware
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ---- enkle API-endepunkt (for å se at backend lever)
app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "ga13-server", ts: new Date().toISOString() });
});

app.get("/api/auth", (_req, res) => {
  // bare en “stub” for nå – svarer 200 OK
  res.json({ ok: true, message: "Auth route fungerer (stub)" });
});

// ---- statiske filer (LEGG HTML/CSS/JS i mappen public)
app.use(express.static(path.join(__dirname, "public")));

// ---- fallback for alle GET-ruter: server index.html
app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ---- start
app.listen(PORT, () => {
  console.log(`✅ Server kjører på port ${PORT}`);
});