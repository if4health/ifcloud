const ApiInfoController = require("../controllers/ApiInfoController");
const router = require("express").Router();


router.get("/infos/routes", ApiInfoController.showRoutes);
router.get("/infos/scripts", ApiInfoController.showScripts);

module.exports = router;