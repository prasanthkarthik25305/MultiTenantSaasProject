const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const tenantController = require("../controllers/tenantController");

// Create tenant (public, but mainly via /auth/register)
router.post("/", tenantController.create);

// List all tenants (super_admin only)
router.get("/", authMiddleware, roleMiddleware("super_admin"), tenantController.list);

// Get tenant details (authenticated users)
router.get("/:id", authMiddleware, tenantController.get);

// Update tenant (tenant_admin or super_admin)
router.put("/:id", authMiddleware, roleMiddleware("tenant_admin", "super_admin"), tenantController.update);

module.exports = router;