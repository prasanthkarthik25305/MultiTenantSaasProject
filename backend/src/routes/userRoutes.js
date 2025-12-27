const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const tenantMiddleware = require("../middlewares/tenantMiddleware");
const userController = require("../controllers/userController");

// All user routes require authentication and tenant isolation
router.use(authMiddleware, tenantMiddleware);

// Create user (tenant_admin only)
router.post("/", roleMiddleware("tenant_admin"), userController.create);

// List users
router.get("/", userController.list);

// Get specific user
router.get("/:id", userController.get);

// Update user (tenant_admin only)
router.put("/:id", roleMiddleware("tenant_admin"), userController.update);

// Deactivate user (tenant_admin only)
router.delete("/:id", roleMiddleware("tenant_admin"), userController.remove);

module.exports = router;