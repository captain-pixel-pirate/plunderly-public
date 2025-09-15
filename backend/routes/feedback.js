const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);
const FEEDBACK_FROM = process.env.FEEDBACK_FROM;
const FEEDBACK_TO = process.env.FEEDBACK_EMAIL_USER;

function rid() {
  return crypto.randomUUID();
}

router.use((req, _res, next) => {
  req._rid = req.headers["x-request-id"]?.toString() || rid();
  next();
});

const MAX_MESSAGE_LEN = 5000;
const MAX_CATEGORY_LEN = 100;
const sanitize = (s, max) =>
  typeof s === "string"
    ? ((s = s.trim()),
      s.length > max ? s.slice(0, max) + `\n\n[truncated at ${max}]` : s)
    : "";

router.post("/", async (req, res) => {
  const id = req._rid;

  console.info(
    JSON.stringify({ level: "info", rid: id, msg: "POST /feedback" })
  );

  const { category: rawCategory, message: rawMessage } = req.body || {};
  if (!rawMessage || typeof rawMessage !== "string" || !rawCategory) {
    console.warn(
      JSON.stringify({ level: "warn", rid: id, msg: "Validation failed" })
    );
    return res.status(400).json({ error: "Invalid input." });
  }

  if (!process.env.RESEND_API_KEY || !FEEDBACK_FROM || !FEEDBACK_TO) {
    console.error(
      JSON.stringify({
        level: "error",
        rid: id,
        msg: "Missing email env vars",
        hasKey: !!process.env.RESEND_API_KEY,
        hasFrom: !!FEEDBACK_FROM,
        hasTo: !!FEEDBACK_TO,
      })
    );
    return res.status(500).json({ error: "Email not configured.", id });
  }

  const category = sanitize(rawCategory, MAX_CATEGORY_LEN);
  const message = sanitize(rawMessage, MAX_MESSAGE_LEN);

  const subject = `Plunderly - ${category}`;
  const text = `Category: ${category}\n\nMessage:\n${message}`;

  try {
    console.info(
      JSON.stringify({
        level: "info",
        rid: id,
        msg: "Sending feedback email",
        envelope: { from: FEEDBACK_FROM, to: FEEDBACK_TO, subject },
      })
    );

    const result = await resend.emails.send({
      from: FEEDBACK_FROM,
      to: FEEDBACK_TO,
      subject,
      text,
    });

    if (result?.error) {
      throw Object.assign(new Error("Resend API error"), {
        details: result.error,
      });
    }

    console.info(
      JSON.stringify({
        level: "info",
        rid: id,
        msg: "Feedback email sent",
        providerId: result?.data?.id,
      })
    );
    return res.json({ success: true, id });
  } catch (err) {
    console.error(
      JSON.stringify({
        level: "error",
        rid: id,
        msg: "Email send failed",
        name: err?.name,
        message: err?.message,
        details: err?.details || null,
      })
    );
    return res.status(500).json({ error: "Failed to send feedback.", id });
  }
});

module.exports = router;
