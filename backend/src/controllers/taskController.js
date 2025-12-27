const knex = require("../config/db");
const crypto = require("crypto");
const auditLogger = require("../utils/auditLogger");

// Create task
exports.create = async (req, res) => {
  try {
    const { project_id, title, description, status, priority, assigned_to, due_date } = req.body;

    if (!project_id || !title) {
      return res.status(400).json({ message: "Project ID and title are required" });
    }

    // Verify project belongs to tenant
    const project = await knex("projects")
      .where({ id: project_id, tenant_id: req.user.tenantId })
      .first();

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const id = uuid();
    await knex("tasks").insert({
      id,
      tenant_id: req.user.tenantId,
      project_id,
      title,
      description: description || null,
      status: status || "todo",
      priority: priority || "medium",
      assigned_to: assigned_to || null,
      due_date: due_date || null
    });

    // Log audit
    await auditLogger({
      tenantId: req.user.tenantId,
      userId: req.user.userId,
      action: "CREATE_TASK",
      entityType: "task",
      entityId: id,
      ip: req.ip
    });

    res.status(201).json({ id, message: "Task created successfully" });
  } catch (error) {
    console.error("Create task error:", error);
    res.status(500).json({ message: "Failed to create task", error: error.message });
  }
};

// List tasks
exports.list = async (req, res) => {
  try {
    const { project_id } = req.query;
    
    let query = knex("tasks")
      .where({ tenant_id: req.user.tenantId });

    if (project_id) {
      query = query.where({ project_id });
    }

    const tasks = await query
      .select("*")
      .orderBy("created_at", "desc");

    res.json(tasks);
  } catch (error) {
    console.error("List tasks error:", error);
    res.status(500).json({ message: "Failed to list tasks", error: error.message });
  }
};

// Update task
exports.update = async (req, res) => {
  try {
    const { title, description, status, priority, assigned_to, due_date } = req.body;
    const updates = {};

    if (title) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (status) updates.status = status;
    if (priority) updates.priority = priority;
    if (assigned_to !== undefined) updates.assigned_to = assigned_to;
    if (due_date !== undefined) updates.due_date = due_date;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "No valid fields to update" });
    }

    updates.updated_at = knex.fn.now();

    const result = await knex("tasks")
      .where({ id: req.params.id, tenant_id: req.user.tenantId })
      .update(updates);

    if (result === 0) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Log audit
    await auditLogger({
      tenantId: req.user.tenantId,
      userId: req.user.userId,
      action: "UPDATE_TASK",
      entityType: "task",
      entityId: req.params.id,
      ip: req.ip
    });

    res.json({ message: "Task updated successfully" });
  } catch (error) {
    console.error("Update task error:", error);
    res.status(500).json({ message: "Failed to update task", error: error.message });
  }
};

// Delete task
exports.remove = async (req, res) => {
  try {
    const result = await knex("tasks")
      .where({ id: req.params.id, tenant_id: req.user.tenantId })
      .del();

    if (result === 0) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Log audit
    await auditLogger({
      tenantId: req.user.tenantId,
      userId: req.user.userId,
      action: "DELETE_TASK",
      entityType: "task",
      entityId: req.params.id,
      ip: req.ip
    });

    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Delete task error:", error);
    res.status(500).json({ message: "Failed to delete task", error: error.message });
  }
};