const router = require("express").Router();

const DirectController = require('../controllers/DirectController');

router.post("/run_script/direct/params", DirectController.runScriptWithParams);

module.exports = router;