const crypto = require("crypto");

exports.seed = async function (knex) {
  // Check if demo tenant already exists
  const existing = await knex("tenants")
    .where({ subdomain: "demo" })
    .first();

  if (existing) {
    console.log("ℹ️ Demo tenant already exists. Skipping tenant seed.");
    return;
  }

  await knex("tenants").insert({
    id: crypto.randomUUID(),
    name: "Demo Company",
    subdomain: "demo",
    status: "active",
    subscription_plan: "pro",
    max_users: 10,
    max_projects: 20    
  });
};
