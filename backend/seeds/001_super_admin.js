const bcrypt = require("bcrypt");
const crypto = require("crypto");

exports.seed = async function (knex) {
  const existing = await knex("users")
    .where({ role: "super_admin" })
    .first();

  if (existing) {
    console.log("ℹ️ Super admin already exists. Skipping seed.");
    return;
  }

  const passwordHash = await bcrypt.hash("Admin@123", 10);

  await knex("users").insert({
    id: crypto.randomUUID(),
    tenant_id: null, // VERY IMPORTANT
    email: "superadmin@system.com",
    password_hash: passwordHash,
    full_name: "System Super Admin",
    role: "super_admin",
    is_active: true
  });
};
