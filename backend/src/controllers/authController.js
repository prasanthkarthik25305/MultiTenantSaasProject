const knex = require("../config/db");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const { generateToken } = require("../utils/jwt");
const auditLogger = require("../utils/auditLogger");

// Register new tenant with admin user
exports.register = async (req, res) => {
  try {
    const { tenantName, subdomain, email, password, fullName } = req.body;

    // Validation
    if (!tenantName || !subdomain || !email || !password || !fullName) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if subdomain exists
    const existingTenant = await knex("tenants").where({ subdomain }).first();
    if (existingTenant) {
      return res.status(400).json({ message: "Subdomain already taken" });
    }

    // Check if email exists
    const existingUser = await knex("users").where({ email }).first();
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Create tenant
    const tenantId = crypto.randomUUID();
    await knex("tenants").insert({
      id: tenantId,
      name: tenantName,
      subdomain: subdomain.toLowerCase(),
      status: "trial",
      subscription_plan: "free",
      max_users: 5,
      max_projects: 3
    });

    // Create tenant admin user
    const userId = crypto.randomUUID();
    const passwordHash = await bcrypt.hash(password, 10);
    await knex("users").insert({
      id: userId,
      tenant_id: tenantId,
      email: email.toLowerCase(),
      password_hash: passwordHash,
      full_name: fullName,
      role: "tenant_admin",
      is_active: true
    });

    // Log audit
    await auditLogger({
      tenantId,
      userId,
      action: "REGISTER_TENANT",
      entityType: "tenant",
      entityId: tenantId,
      ip: req.ip
    });

    // Generate token
    const token = generateToken({
      userId,
      tenantId,
      role: "tenant_admin"
    });

    res.status(201).json({
      message: "Tenant registered successfully",
      token,
      tenant: { id: tenantId, name: tenantName, subdomain }
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Registration failed", error: error.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await knex("users")
      .where({ email: email.toLowerCase(), is_active: true })
      .first();

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Log audit
    // Log audit ONLY for tenant-scoped users
  if (user.tenant_id) {
      await auditLogger({
        tenantId: user.tenant_id,
        userId: user.id,
        action: "LOGIN",
        entityType: "user",
        entityId: user.id,
        ip: req.ip
      });
  }


    const token = generateToken({
      userId: user.id,
      tenantId: user.tenant_id,
      role: user.role
    });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
        tenantId: user.tenant_id
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Login failed", error: error.message });
  }
};

// Get current user
exports.me = async (req, res) => {
  try {
    const user = await knex("users")
      .where({ id: req.user.userId })
      .select("id", "email", "full_name", "role", "tenant_id", "is_active")
      .first();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      role: user.role,
      tenantId: user.tenant_id,
      isActive: user.is_active
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ message: "Failed to get user", error: error.message });
  }
};

// Logout (client-side token removal)
exports.logout = async (req, res) => {
  try {
    // Log audit
    // Log audit ONLY for tenant-scoped users
    if (req.user.tenantId) {
      await auditLogger({
        tenantId: req.user.tenantId,
        userId: req.user.userId,
        action: "LOGOUT",
        entityType: "user",
        entityId: req.user.userId,
        ip: req.ip
      });
   }


    res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Logout failed", error: error.message });
  }
};