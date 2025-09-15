require("dotenv").config();
const crypto = require("crypto");

function verifyHMAC(req, res, next) {
  const secret = process.env.REFRESH_SECRET;
  const signature = req.headers["x-signature"];
  const timestamp = req.headers["x-timestamp"];

  if (!signature || !timestamp) {
    return res.status(400).json({ error: "Missing signature or timestamp" });
  }

  // Prevent replay attacks: timestamp must be within 5 minutes (300s)
  const now = Math.floor(Date.now() / 1000);
  const timeDiff = Math.abs(now - parseInt(timestamp, 10));
  if (timeDiff > 300) {
    return res
      .status(403)
      .json({ error: "Timestamp too far from current time" });
  }

  const message = `/refresh:${timestamp}`;
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(message)
    .digest("hex");

  if (signature !== expectedSignature) {
    return res.status(403).json({ error: "Invalid signature" });
  }

  next();
}

module.exports = {
  verifyHMAC,
};
