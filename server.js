// server.js
const express = require("express");
const path = require("path");
const cors = require("cors");
const morgan = require("morgan");
require("dotenv").config();
const app = express();

const PORT = Number(process.env.PORT || 5000);

// middleware
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// === API-ruter ===
app.use("/api/auth", require("./routes/auth"));     // hvis du allerede har denne
app.use("/api/ads", require("./routes/ads"));       //  <— LEGG TIL DENNE

// === statiske filer ===
const publicDir = path.join(__dirname, "public");
app.use(express.static(publicDir));

// fallback til index.html for "vanlige" GET-ruter
app.get("*", (req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

app.listen(PORT, () => console.log(`Server kjører på port ${PORT}`));



