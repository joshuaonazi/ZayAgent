const dotenv = require("dotenv");
dotenv.config();

const env = {
  PORT:               process.env.PORT               || 5000,
  NODE_ENV:           process.env.NODE_ENV           || "development",
  MONGO_URI:          process.env.MONGO_URI          || "mongodb://localhost:27017/zaygent",
  JWT_SECRET:         process.env.JWT_SECRET         || "zaygent_secret",
  JWT_EXPIRES_IN:     process.env.JWT_EXPIRES_IN     || "7d",
  HASH_SALT:          process.env.HASH_SALT          || "zaygent_salt",
  DEXSCREENER_BASE_URL: process.env.DEXSCREENER_BASE_URL || "https://api.dexscreener.com/latest",
  CLIENT_URL:         process.env.CLIENT_URL         || "http://localhost:3000",
};

// Validate required fields
const required = ["JWT_SECRET", "HASH_SALT", "MONGO_URI"];
required.forEach((key) => {
  if (!process.env[key]) {
    console.warn(`⚠️  Warning: ${key} is not set in .env — using default`);
  }
});

module.exports = env;