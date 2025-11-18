const router = require("express").Router();
const OperationController = require('../controllers/OperationController');

router.post("/run_script/operation", OperationController.operationStarter);

module.exports = router;
