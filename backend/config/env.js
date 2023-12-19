const dotenv = require("dotenv");

dotenv.config();

module.exports = {
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
  JWT_COOKIE_EXPIRES_IN: process.env.JWT_COOKIE_EXPIRES_IN,
  JWT_EXPIRES_FORGET_PASSWORD: process.env.JWT_EXPIRES_FORGET_PASSWORD,
  JWT_EXPIRATION_FORGET_PASSWORD: process.env.JWT_EXPIRATION_FORGET_PASSWORD,
  JWT_EXPIRATION: process.env.JWT_EXPIRATION,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  CLIENT_URL: process.env.CLIENT_URL,
};
