const knex = require("../config/db");
const crypto = require("crypto");
const auditLogger = require("../utils/auditLogger");

// Create tenant (super_admin only, but mainly used via register)
exports.create = async (req, res) => {
  try {
    const { name, subdomain, max_users, max_projects, subscription_plan } = req.body;

    if (!name || !subdomain) {
      return res.status(400).json({ message: "Name and subdomain are required" });
    }

    const existing = await knex("tenants").where({ subdomain }).first();
    if (existing) {
      return res.status(400).json({ message: "Subdomain already exists" });
    }

    const id = uuid();
    await knex("tenants").insert({
      id,
      name,
      subdomain: subdomain.toLowerCase(),
      status: "trial",
      subscription_plan: subscription_plan || "free",
      max_users: max_users || 5,
      max_projects: max_projects || 3
    });

    res.status(201).json({ id, message: "Tenant created successfully" });
  } catch (error) {
    console.error("Create tenant error:", error);
    res.status(500).json({ message: "Failed to create tenant", error: error.message });
  }
};

// List all tenants (super_admin only)
exports.list = async (req, res) => {
  try {
    const tenants = await knex("tenants").select("*");
    res.json(tenants);
  } catch (error) {
    console.error("List tenants error:", error);
    res.status(500).json({ message: "Failed to list tenants", error: error.message });
  }
};

// Get tenant details
exports.get = async (req, res) => {
  try {
    const tenantId = req.params.id || req.user.tenantId;
    
    const tenant = await knex("tenants")
      .where({ id: tenantId })
      .first();

    if (!tenant) {
      return res.status(404).json({ message: "Tenant not found" });
    }

    res.json(tenant);
  } catch (error) {
    console.error("Get tenant error:", error);
    res.status(500).json({ message: "Failed to get tenant", error: error.message });
  }
};

// Update tenant
exports.update = async (req, res) => {
  try {
    const tenantId = req.params.id || req.user.tenantId;
    const { name, status, subscription_plan, max_users, max_projects } = req.body;

    const updates = {};
    if (name) updates.name = name;
    if (status) updates.status = status;
    if (subscription_plan) updates.subscription_plan = subscription_plan;
    if (max_users) updates.max_users = max_users;
    if (max_projects) updates.max_projects = max_projects;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "No valid fields to update" });
    }

    updates.updated_at = knex.fn.now();

    const result = await knex("tenants")
      .where({ id: tenantId })
      .update(updates);

    if (result === 0) {
      return res.status(404).json({ message: "Tenant not found" });
    }

    // Log audit
    await auditLogger({
      tenantId,
      userId: req.user.userId,
      action: "UPDATE_TENANT",
      entityType: "tenant",
      entityId: tenantId,
      ip: req.ip
    });

    res.json({ message: "Tenant updated successfully" });
  } catch (error) {
    console.error("Update tenant error:", error);
    res.status(500).json({ message: "Failed to update tenant", error: error.message });
  }
};