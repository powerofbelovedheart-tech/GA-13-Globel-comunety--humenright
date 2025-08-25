// server/vipps.js
const Vipps = require("vipps-node");

// Sett miljøvariabler i .env
const clientId = process.env.VIPPS_CLIENT_ID || "your-client-id";
const clientSecret = process.env.VIPPS_CLIENT_SECRET || "your-client-secret";
const subscriptionKey = process.env.VIPPS_SUBSCRIPTION_KEY || "your-sub-key";
const merchantSerialNumber = process.env.VIPPS_MSN || "your-msn";

const vipps = new Vipps({
  clientId,
  clientSecret,
  subscriptionKey,
  merchantSerialNumber,
  testDrive: true, // Sett til false i produksjon
});

module.exports = vipps;