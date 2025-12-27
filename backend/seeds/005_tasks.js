const crypto = require("crypto");

exports.seed = async function (knex) {
  const tenant = await knex("tenants")
    .where({ subdomain: "demo" })
    .first();

  // Safety check
  if (!tenant) {
    console.log("⚠️ No demo tenant found. Skipping task seeds.");
    return;
  }

  const projects = await knex("projects")
    .where({ tenant_id: tenant.id })
    .limit(2);

  const users = await knex("users")
    .where({ tenant_id: tenant.id })
    .limit(3);

  // Safety checks
  if (projects.length < 2 || users.length < 2) {
    console.log("⚠️ Not enough projects or users. Skipping task seeds.");
    return;
  }

  await knex("tasks").where({ tenant_id: tenant.id }).del();

  await knex("tasks").insert([
    {
      id: crypto.randomUUID(),
      tenant_id: tenant.id,
      project_id: projects[0].id,
      title: "Setup project repo",
      status: "todo",
      priority: "high",
      assigned_to: users[0].id
    },
    {
      id: crypto.randomUUID(),
      tenant_id: tenant.id,
      project_id: projects[0].id,
      title: "Design database",
      status: "in_progress",
      priority: "medium",
      assigned_to: users[1].id
    },
    {
      id: crypto.randomUUID(),
      tenant_id: tenant.id,
      project_id: projects[1].id,
      title: "Create API endpoints",
      status: "todo",
      priority: "high",
      assigned_to: users[0].id
    },
    {
      id: crypto.randomUUID(),
      tenant_id: tenant.id,
      project_id: projects[1].id,
      title: "Frontend UI",
      status: "todo",
      priority: "medium"
    },
    {
      id: crypto.randomUUID(),
      tenant_id: tenant.id,
      project_id: projects[1].id,
      title: "Testing & QA",
      status: "todo",
      priority: "low"
    }
  ]);
};
