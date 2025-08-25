const router = require("express").Router();
const requireAuth = require("../middleware/requireAuth");
const stripe = require("../lib/stripe");

router.post("/checkout", requireAuth, async (req, res) => {
  try {
    if (!stripe) return res.status(500).json({ error: "Stripe ikke satt opp" });

    const { amount, currency } = req.body;
    if (!amount) return res.status(400).json({ error: "Beløp mangler" });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: (currency || "nok").toLowerCase(),
            product_data: { name: "GA-13 Listing Fee" },
            unit_amount: Math.round(Number(amount) * 100)
          },
          quantity: 1
        }
      ],
      success_url: `${process.env.PUBLIC_BASE_URL}/success.html`,
      cancel_url: `${process.env.PUBLIC_BASE_URL}/cancel.html`
    });

    res.json({ id: session.id, url: session.url });
  } catch (err) {
    console.error("Stripe error:", err);
    res.status(500).json({ error: "Stripe-feil" });
  }
});

module.exports = router;