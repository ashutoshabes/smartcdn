const rateLimit = require('express-rate-limit');

// Limits each user to 60 simulated requests per minute — generous enough
// for real testing/demoing, but stops runaway loops or abuse.
const simulateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: { success: false, message: 'Too many requests — please slow down and try again in a moment.' },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { simulateLimiter };