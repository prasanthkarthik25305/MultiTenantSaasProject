const knex = require("../config/db");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const auditLogger = require("../utils/auditLogger");

// Create user
exports.create = async (req, res) => {
  try {
    const { email, password, full_name, role } = req.body;

    // Validation
    if (!email || !password || !full_name || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!["tenant_admin", "user"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    // Check if email exists in tenant
    const existing = await knex("users")
      .where({ email: email.toLowerCase(), tenant_id: req.user.tenantId })
      .first();

    if (existing) {
      return res.status(400).json({ message: "Email already exists in this tenant" });
    }

    const id = uuid();
    const passwordHash = await bcrypt.hash(password, 10);

    await knex("users").insert({
      id,
      tenant_id: req.user.tenantId,
      email: email.toLowerCase(),
      password_hash: passwordHash,
      full_name,
      role,
      is_active: true
    });

    // Log audit
    await auditLogger({
      tenantId: req.user.tenantId,
      userId: req.user.userId,
      action: "CREATE_USER",
      entityType: "user",
      entityId: id,
      ip: req.ip
    });

    res.status(201).json({ id, message: "User created successfully" });
  } catch (error) {
    console.error("Create user error:", error);
    res.status(500).json({ message: "Failed to create user", error: error.message });
  }
};

// List users
exports.list = async (req, res) => {
  try {
    const users = await knex("users")
      .where({ tenant_id: req.user.tenantId, is_active: true })
      .select("id", "email", "full_name", "role", "created_at");

    res.json(users);
  } catch (error) {
    console.error("List users error:", error);
    res.status(500).json({ message: "Failed to list users", error: error.message });
  }
};

// Get user
exports.get = async (req, res) => {
  try {
    const user = await knex("users")
      .where({ id: req.params.id, tenant_id: req.user.tenantId })
      .select("id", "email", "full_name", "role", "is_active", "created_at")
      .first();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ message: "Failed to get user", error: error.message });
  }
};

// Update user
exports.update = async (req, res) => {
  try {
    const { full_name, role } = req.body;
    const updates = {};

    if (full_name) updates.full_name = full_name;
    if (role && ["tenant_admin", "user"].includes(role)) updates.role = role;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "No valid fields to update" });
    }

    updates.updated_at = knex.fn.now();

    const result = await knex("users")
      .where({ id: req.params.id, tenant_id: req.user.tenantId })
      .update(updates);

    if (result === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // Log audit
    await auditLogger({
      tenantId: req.user.tenantId,
      userId: req.user.userId,
      action: "UPDATE_USER",
      entityType: "user",
      entityId: req.params.id,
      ip: req.ip
    });

    res.json({ message: "User updated successfully" });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({ message: "Failed to update user", error: error.message });
  }
};

// Deactivate user
exports.remove = async (req, res) => {
  try {
    const result = await knex("users")
      .where({ id: req.params.id, tenant_id: req.user.tenantId })
      .update({ is_active: false, updated_at: knex.fn.now() });

    if (result === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // Log audit
    await auditLogger({
      tenantId: req.user.tenantId,
      userId: req.user.userId,
      action: "DEACTIVATE_USER",
      entityType: "user",
      entityId: req.params.id,
      ip: req.ip
    });

    res.json({ message: "User deactivated successfully" });
  } catch (error) {
    console.error("Deactivate user error:", error);
    res.status(500).json({ message: "Failed to deactivate user", error: error.message });
  }
};