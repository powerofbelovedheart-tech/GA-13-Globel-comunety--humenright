const fs = require("fs");
const path = require("path");
const router = require("express").Router();
const requireAuth = require("../middleware/requireAuth");

const adsFile = path.join(__dirname, "..", "models", "ads.json");

function loadAds() {
  if (!fs.existsSync(adsFile)) return [];
  return JSON.parse(fs.readFileSync(adsFile, "utf8") || "[]");
}
function saveAds(ads) {
  fs.writeFileSync(adsFile, JSON.stringify(ads, null, 2), "utf8");
}

// Hent alle annonser
router.get("/", (req, res) => {
  res.json(loadAds());
});

// Opprett annonse
router.post("/", requireAuth, (req, res) => {
  const { title, price, category, media } = req.body;
  if (!title) return res.status(400).json({ error: "Tittel kreves" });
  const ads = loadAds();
  const ad = {
    id: Date.now().toString(),
    title,
    price: Number(price) || 0,
    category: category || "Annet",
    media: media || [],
    owner: "demo@ga13.no",
    createdAt: new Date().toISOString()
  };
  ads.push(ad);
  saveAds(ads);
  res.json({ ok: true, ad });
});

module.exports = router;