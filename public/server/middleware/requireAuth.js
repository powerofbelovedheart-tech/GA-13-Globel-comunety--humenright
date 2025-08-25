// middleware/requireAuth.js
module.exports = function requireAuth(req, res, next) {
  // TODO: bytt til ekte token-sjekk senere (f.eks. JWT)
  next();
};