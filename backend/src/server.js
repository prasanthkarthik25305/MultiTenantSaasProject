require("dotenv").config();
const app = require("./app");
const waitForDb = require("./utils/waitForDb");
const knexConfig = require("../knexfile");
const Knex = require("knex");

const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await waitForDb();

    console.log("📦 Initializing database...");
    const knex = Knex(knexConfig.development);

    console.log("📦 Running migrations...");
    await knex.migrate.latest();

    console.log("🌱 Running seeds...");
    await knex.seed.run();

    app.listen(PORT, () => {
      console.log(`🚀 Backend running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Backend startup failed");
    console.error(err);
    process.exit(1);
  }
})();
