// routes/payments.js
const express = require("express");
const router = express.Router();

const STRIPE_KEY = process.env.STRIPE_SECRET_KEY || "";

// POST /api/pay/checkout  { amount: 1000, currency: "nok" }
router.post("/checkout", async (req, res) => {
  try {
    const { amount, currency } = req.body || {};
    if (!amount || isNaN(Number(amount))) {
      return res.status(400).json({ ok: false, error: "Beløp mangler/ugyldig" });
    }

    if (!STRIPE_KEY) {
      // ingen nøkkel – vis pent at betalingen ikke er aktivert ennå
      return res.status(501).json({
        ok: false,
        error: "Stripe ikke konfigurert (sett STRIPE_SECRET_KEY i .env)"
      });
    }

    const stripe = require("stripe")(STRIPE_KEY);
    const baseUrl = process.env.PUBLIC_BASE_URL || `http://localhost:${process.env.PORT || 5000}`;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: (currency || "nok").toLowerCase(),
            product_data: { name: "GA-13 Listing Fee" },
            unit_amount: Number(amount) * 100
          },
          quantity: 1
        }
      ],
      success_url: `${baseUrl}/success.html`,
      cancel_url: `${baseUrl}/cancel.html`
    });

    return res.json({ ok: true, id: session.id, url: session.url });
  } catch (err) {
    console.error("payments/checkout error:", err);
    return res.status(500).json({ ok: false, error: "Ukjent betalingsfeil" });
  }
});

module.exports = router;