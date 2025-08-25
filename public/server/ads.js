const express = require("express");
const { readFile, writeFile } = require("fs/promises");
const path = require("path");
const router = express.Router();

const DATA_FILE = path.join(__dirname, "..", "data", "ads.json");

// helpers
async function load() {
  const buf = await readFile(DATA_FILE, "utf-8");
  const json = JSON.parse(buf);
  return Array.isArray(json.ads) ? json.ads : [];
}
async function save(ads) {
  const json = { ads };
  await writeFile(DATA_FILE, JSON.stringify(json, null, 2), "utf-8");
}
const newId = () => Math.random().toString(36).slice(2, 10);

// GET /api/ads?search=&category=
router.get("/", async (req, res) => {
  const { search = "", category = "" } = req.query;
  const all = await load();
  let out = all;
  if (search) {
    const s = search.toLowerCase();
    out = out.filter(
      a =>
        a.title.toLowerCase().includes(s) ||
        a.description.toLowerCase().includes(s) ||
        a.location.toLowerCase().includes(s)
    );
  }
  if (category) {
    out = out.filter(a => a.category === category);
  }
  // sort nyeste først
  out = out.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(out);
});

// GET /api/ads/:id
router.get("/:id", async (req, res) => {
  const all = await load();
  const ad = all.find(a => a.id === req.params.id);
  if (!ad) return res.status(404).json({ error: "Not found" });
  res.json(ad);
});

// POST /api/ads
router.post("/", async (req, res) => {
  const { title, price, category, imageUrl, location, description, owner } = req.body;

  if (!title || !price) {
    return res.status(400).json({ error: "Mangler tittel eller pris" });
  }

  const ad = {
    id: newId(),
    title: String(title).trim(),
    price: Number(price),
    category: String(category || "Annet"),
    imageUrl:
      imageUrl ||
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200",
    location: String(location || ""),
    description: String(description || ""),
    owner: String(owner || "ukjent"),
    createdAt: new Date().toISOString()
  };

  const all = await load();
  all.push(ad);
  await save(all);

  res.status(201).json(ad);
});

// PUT /api/ads/:id
router.put("/:id", async (req, res) => {
  const all = await load();
  const idx = all.findIndex(a => a.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Not found" });

  const current = all[idx];
  const next = {
    ...current,
    ...req.body,
    id: current.id, // lås id
    price: req.body.price !== undefined ? Number(req.body.price) : current.price
  };

  all[idx] = next;
  await save(all);
  res.json(next);
});

// DELETE /api/ads/:id
router.delete("/:id", async (req, res) => {
  const all = await load();
  const idx = all.findIndex(a => a.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Not found" });

  all.splice(idx, 1);
  await save(all);
  res.json({ ok: true });
});

module.exports = router;