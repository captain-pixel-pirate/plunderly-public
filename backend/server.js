require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const { sequelize } = require("./models");

/** Routes */
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
const PORT = Number(process.env.PORT) || 5000;
const NODE_ENV = process.env.NODE_ENV || "development";

/**
 * CORS allowlist: match exact hosts and Vercel previews.
 */
const allowedOrigins = [
  "http://localhost:3000",
  "https://profiteer-kohl.vercel.app",
  "https://www.profiteer-kohl.vercel.app",
  "https://plunderly.app",
  "https://www.plunderly.app",
];

const allowedOriginPatterns = [/^https:\/\/.*\.vercel\.app$/];

function isAllowedOrigin(origin) {
  if (!origin) return true; // allow curl / server-to-server
  if (allowedOrigins.includes(origin)) return true;
  return allowedOriginPatterns.some((re) => re.test(origin));
}

/** Middlewares */
app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      if (isAllowedOrigin(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  })
);

app.use(express.json({ limit: "1mb" }));
app.use(compression());
app.use(morgan(NODE_ENV === "production" ? "combined" : "dev"));

/** Trust proxy */
app.set("trust proxy", 1);

/** Basic rate limit */
app.use(
  rateLimit({
    windowMs: 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

// Routes
app.get("/healthz", (req, res) => res.status(200).send("ok"));
app.get("/", (req, res) => res.send("🚀 Server is running!"));

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

app.use((req, res, next) => {
  res.status(404).json({ error: "Not Found" });
});

app.use((err, req, res, next) => {
  const status = err.status || 500;
  const payload =
    NODE_ENV === "production"
      ? { error: err.message || "Internal Server Error" }
      : { error: err.message, stack: err.stack };
  res.status(status).json(payload);
});

let server;

async function startServer() {
  try {
    await sequelize.authenticate();
    server = app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server listening on ${PORT}`);
    });
  } catch (error) {
    console.error("Error starting server:", error);
    process.exit(1);
  }
}

/** Graceful shutdown */
function shutdown(signal) {
  console.log(`${signal} received, shutting down...`);
  if (server) {
    server.close(async () => {
      try {
        await sequelize.close();
      } catch (_) {}
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
}
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

startServer();
