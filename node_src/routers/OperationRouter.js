const router = require("express").Router();
const path = require("path");

const OperationController = require('../controllers/OperationController');

router.post("/run_script/operation", OperationController.operationStarter);

router.post("/myForm", OperationController.myForm);

module.exports = router;
