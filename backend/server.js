require("dotenv").config();

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const { sequelize } = require("./models");

const taxes = require("./routes/taxes");
const island = require("./routes/island");
const recipes = require("./routes/recipes");
const commods = require("./routes/commods");
const oceans = require("./routes/oceans");
const shoppes = require("./routes/shoppes");
const marketdata = require("./routes/marketdata");
const vessels = require("./routes/vessels");
const pirateCraftingSkills = require("./routes/pirateCraftingSkills");
const feedback = require("./routes/feedback");
const yaarg = require("./routes/yaarg");

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  "http://localhost:3000",
  "https://profiteer-kohl.vercel.app",
  "https://plunderly.app/",
  "https://plunderly.app",
  "plunderly.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

app.use(express.json());
app.use(morgan("dev"));
app.set("trust proxy", true);

app.use("/taxes", taxes);
app.use("/island", island);
app.use("/recipes", recipes);
app.use("/commods", commods);
app.use("/oceans", oceans);
app.use("/shoppes", shoppes);
app.use("/marketdata", marketdata);
app.use("/vessels", vessels);
app.use("/pirateCraftingSkills", pirateCraftingSkills);
app.use("/feedback", feedback);
app.use("/yaarg", yaarg);

app.get("/", (req, res) => {
  res.send("🚀 Server is running!");
});

async function startServer() {
  try {
    await sequelize.authenticate();
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server listening on ${PORT}`);
    });
  } catch (error) {
    console.error("Error starting server:", error);
  }
}

startServer();
