const router = require("express").Router();
const auth = require("../middlewares/authMiddleware");
const tenant = require("../middlewares/tenantMiddleware");
const ctrl = require("../controllers/taskController");

router.use(auth, tenant);

router.post("/", ctrl.create);        // 16
router.get("/", ctrl.list);           // 17
router.put("/:id", ctrl.update);      // 18
router.delete("/:id", ctrl.remove);   // 19

module.exports = router;
