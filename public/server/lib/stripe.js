const Stripe = require("stripe");
const secret = process.env.STRIPE_SECRET_KEY;
if (!secret) {
  console.warn("⚠️ STRIPE_SECRET_KEY mangler. /api/payments/checkout vil feile.");
}
const stripe = secret ? new Stripe(secret) : null;
module.exports = stripe;