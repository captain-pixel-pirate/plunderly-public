require("dotenv").config();
const axios = require("axios");

const endpoint = process.env.REFRESH_ENDPOINT;

async function runRefresh() {
  try {
    const response = await axios.post(
      endpoint,
      {},
      {
        timeout: 10000,
      }
    );

    console.log(`[SUCCESS] Yaarg Refresh completed:`, response.data.message);
  } catch (err) {
    console.error(
      `[FAILURE] Yaarg Refresh failed:`,
      err.response?.data || err.message
    );
  }
}

runRefresh();
