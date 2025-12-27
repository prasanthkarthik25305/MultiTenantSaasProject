const bcrypt = require("bcrypt");
const crypto = require("crypto");

exports.seed = async function (knex) {
  const tenant = await knex("tenants")
    .where({ subdomain: "demo" })
    .first();

  // Safety check (DO NOT throw)
  if (!tenant) {
    console.log("⚠️ Demo tenant not found. Skipping user seeds.");
    return;
  }

  // Delete users ONLY for this tenant (never global)
  await knex("users")
    .where({ tenant_id: tenant.id })
    .whereNot({ role: "super_admin" })
    .del();

  const adminPassword = await bcrypt.hash("Demo@123", 10);
  const userPassword = await bcrypt.hash("User@123", 10);

  await knex("users").insert([
    {
      id: crypto.randomUUID(),
      tenant_id: tenant.id,
      email: "admin@demo.com",
      password_hash: adminPassword,
      full_name: "Demo Tenant Admin",
      role: "tenant_admin",
      is_active: true
    },
    {
      id: crypto.randomUUID(),
      tenant_id: tenant.id,
      email: "user1@demo.com",
      password_hash: userPassword,
      full_name: "Demo User One",
      role: "user",
      is_active: true
    },
    {
      id: crypto.randomUUID(),
      tenant_id: tenant.id,
      email: "user2@demo.com",
      password_hash: userPassword,
      full_name: "Demo User Two",
      role: "user",
      is_active: true     
    }
  ]);
};
