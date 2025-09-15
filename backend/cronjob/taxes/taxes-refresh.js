require("dotenv").config();
const crypto = require("crypto");
const axios = require("axios");

const endpoint = process.env.REFRESH_ENDPOINT;
const secret = process.env.REFRESH_SECRET;

async function runRefresh() {
  const timestamp = Math.floor(Date.now() / 1000);
  const message = `/refresh:${timestamp}`;

  const signature = crypto
    .createHmac("sha256", secret)
    .update(message)
    .digest("hex");

  try {
    const response = await axios.post(
      endpoint,
      {},
      {
        headers: {
          "X-Timestamp": timestamp,
          "X-Signature": signature,
        },
        timeout: 10000,
      }
    );

    console.log(`[SUCCESS] Refresh completed:`, response.data.message);
  } catch (err) {
    console.error(
      `[FAILURE] Refresh failed:`,
      err.response?.data || err.message
    );
  }
}

runRefresh();
