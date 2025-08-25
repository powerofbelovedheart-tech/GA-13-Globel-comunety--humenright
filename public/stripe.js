// server/stripe.js
const express = require("express");
const router = express.Router();

const STRIPE_SECRET = process.env.STRIPE_SECRET || "sk_test_xxx"; // legg inn .env i prod
const stripe = require("stripe")(STRIPE_SECRET);

// POST /api/checkout  -> lager en Checkout Session (enkeltbeløp)
router.post("/checkout", async (req, res) => {
  try {
    const { amount, currency } = req.body || {};
    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ error: "Beløp mangler/ugyldig" });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: (currency || "nok").toLowerCase(),
            product_data: { name: "GA-13 publiseringsavgift" },
            unit_amount: Math.round(Number(amount) * 100) // i øre
          },
          quantity: 1
        }
      ],
      // Stripe legger ?session_id={CHECKOUT_SESSION_ID} på success_url
      success_url: "http://localhost:3000/success.html?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: "http://localhost:3000/cancel.html"
    });

    res.json({ id: session.id, url: session.url });
  } catch (err) {
    console.error("Stripe checkout error:", err);
    res.status(500).json({ error: "Stripe-feil ved oppretting" });
  }
});

// GET /api/verify-payment?session_id=cs_test_...
// -> returnerer {paid:true/false, amount}
router.get("/verify-payment", async (req, res) => {
  try {
    const { session_id } = req.query;
    if (!session_id) return res.status(400).json({ error: "Mangler session_id" });

    const session = await stripe.checkout.sessions.retrieve(session_id.toString());
    const paid = session.payment_status === "paid";
    const amountTotal = session.amount_total != null ? session.amount_total / 100 : null;

    res.json({ paid, amount: amountTotal, currency: session.currency, id: session.id });
  } catch (err) {
    console.error("Stripe verify error:", err);
    res.status(500).json({ error: "Stripe-verifisering feilet" });
  }
});

module.exports = router;// public/stripe.js
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("btnPay");
  const amountEl = document.getElementById("amount");
  const userIdEl = document.getElementById("userId");

  if (!btn) return;

  btn.addEventListener("click", async () => {
    const amount = Number(amountEl?.value || 0);
    const userId = userIdEl?.value?.trim();

    if (!userId) {
      alert("Skriv inn en midlertidig bruker-ID (erstattes med ekte innlogging senere).");
      return;
    }
    if (!amount || amount < 10) {
      alert("Beløp må være minst 10 NOK.");
      return;
    }

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userId
        },
        body: JSON.stringify({ amount, currency: "NOK" })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Ukjent feil");
      }
      const out = await res.json();
      if (out.url) {
        window.location = out.url; // send bruker til Stripe Checkout
      } else {
        alert("Mottok ingen checkout-URL.");
      }
    } catch (e) {
      console.error(e);
      alert(e.message || "Kunne ikke starte betaling.");
    }
  });
});