const crypto = require("crypto");

exports.seed = async function (knex) {
  const tenant = await knex("tenants")
    .where({ subdomain: "demo" })
    .first();

  // Safety check
  if (!tenant) {
    console.log("⚠️ No demo tenant found. Skipping project seeds.");
    return;
  }

  const admin = await knex("users")
    .where({ tenant_id: tenant.id, role: "tenant_admin" })
    .first();

  // Safety check
  if (!admin) {
    console.log("⚠️ No tenant admin found. Skipping project seeds.");
    return;
  }

  await knex("projects").where({ tenant_id: tenant.id }).del();

  await knex("projects").insert([
    {
      id: crypto.randomUUID(),
      tenant_id: tenant.id,
      name: "Demo Project Alpha",
      description: "First demo project",
      status: "active",
      created_by: admin.id
    },
    {
      id: crypto.randomUUID(),
      tenant_id: tenant.id,
      name: "Demo Project Beta",
      description: "Second demo project",
      status: "active",
      created_by: admin.id   
    }
  ]);
};
