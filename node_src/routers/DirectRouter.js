const router = require("express").Router();

const DirectController = require('../controllers/DirectController');

router.get("/run_script/direct/:script_name", DirectController.runScriptByScriptName);
router.post("/run_script/direct/params", DirectController.runScriptWithParams);

module.exports = router;