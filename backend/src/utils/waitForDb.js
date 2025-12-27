const { Client } = require("pg");

const waitForDb = async () => {
  const maxRetries = 10;
  let retries = 0;

  while (retries < maxRetries) {
    try {
      const client = new Client({
        host: process.env.DB_HOST,
        user: process.env.POSTGRES_USER,
        password: process.env.POSTGRES_PASSWORD,
        database: process.env.POSTGRES_DB,
        port: 5432,
      });

      await client.connect();
      await client.end();

      console.log("✅ Database is ready");
      return;
    } catch (err) {
      retries++;
      console.log(
        `⏳ Waiting for database... (${retries}/${maxRetries})`
      );
      await new Promise((res) => setTimeout(res, 3000));
    }
  }

  throw new Error("❌ Database not reachable after retries");
};

module.exports = waitForDb;
