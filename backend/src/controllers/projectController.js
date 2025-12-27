const knex = require("../config/db");
const crypto = require("crypto");
const auditLogger = require("../utils/auditLogger");

// Create project
exports.create = async (req, res) => {
  try {
    const { name, description, status } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Project name is required" });
    }

    const id = uuid();
    await knex("projects").insert({
      id,
      tenant_id: req.user.tenantId,
      name,
      description: description || null,
      status: status || "active",
      created_by: req.user.userId
    });

    // Log audit
    await auditLogger({
      tenantId: req.user.tenantId,
      userId: req.user.userId,
      action: "CREATE_PROJECT",
      entityType: "project",
      entityId: id,
      ip: req.ip
    });

    res.status(201).json({ id, message: "Project created successfully" });
  } catch (error) {
    console.error("Create project error:", error);
    res.status(500).json({ message: "Failed to create project", error: error.message });
  }
};

// List projects
exports.list = async (req, res) => {
  try {
    const projects = await knex("projects")
      .where({ tenant_id: req.user.tenantId })
      .select("*")
      .orderBy("created_at", "desc");

    res.json(projects);
  } catch (error) {
    console.error("List projects error:", error);
    res.status(500).json({ message: "Failed to list projects", error: error.message });
  }
};

// Update project
exports.update = async (req, res) => {
  try {
    const { name, description, status } = req.body;
    const updates = {};

    if (name) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (status) updates.status = status;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "No valid fields to update" });
    }

    updates.updated_at = knex.fn.now();

    const result = await knex("projects")
      .where({ id: req.params.id, tenant_id: req.user.tenantId })
      .update(updates);

    if (result === 0) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Log audit
    await auditLogger({
      tenantId: req.user.tenantId,
      userId: req.user.userId,
      action: "UPDATE_PROJECT",
      entityType: "project",
      entityId: req.params.id,
      ip: req.ip
    });

    res.json({ message: "Project updated successfully" });
  } catch (error) {
    console.error("Update project error:", error);
    res.status(500).json({ message: "Failed to update project", error: error.message });
  }
};

// Delete project
exports.remove = async (req, res) => {
  try {
    const result = await knex("projects")
      .where({ id: req.params.id, tenant_id: req.user.tenantId })
      .del();

    if (result === 0) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Log audit
    await auditLogger({
      tenantId: req.user.tenantId,
      userId: req.user.userId,
      action: "DELETE_PROJECT",
      entityType: "project",
      entityId: req.params.id,
      ip: req.ip
    });

    res.json({ message: "Project deleted successfully" });
  } catch (error) {
    console.error("Delete project error:", error);
    res.status(500).json({ message: "Failed to delete project", error: error.message });
  }
};