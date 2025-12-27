const router = require("express").Router();
const auth = require("../middlewares/authMiddleware");
const tenant = require("../middlewares/tenantMiddleware");
const ctrl = require("../controllers/projectController");

router.use(auth, tenant);

router.post("/", ctrl.create);        // 12
router.get("/", ctrl.list);           // 13
router.put("/:id", ctrl.update);      // 14
router.delete("/:id", ctrl.remove);   // 15

module.exports = router;
