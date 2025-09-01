const HandleError = require("../operations/erros/HandleError");
const { processParamFilter } = require("../operations/support/runScriptWithParamsSuport");
const { validateFormRunScriptWithParams } = require("../operations/validations/runScriptWithParamsValidation");
const runScript = require("../RunPythonScript");
const fs = require('fs/promises');

class DirectController{

    async runScriptByScriptName(req, res){
        try {
            const run = new runScript();
            var scriptName = req.params.script_name;

            if(run.runPythonScriptNotParams(scriptName)){
                return res.send(run.runPythonScriptNotParams(scriptName));
            }else{
                return res.send("!!! Script \""+scriptName+"\" not found !!!");
            }
        } catch (e) {
            console.log(e);
        }
    }

    async runScriptWithParams(req, res){
        try {

            validateFormRunScriptWithParams(req.body);
            
            const { scriptName, params } = req.body;

            const processedData = await processParamFilter(scriptName, params);

            return res.send(processedData);
        } catch (e) {
            console.log(e);
            return res.status(e.statusCode || 500).json(e);
        }
    }
}

module.exports = new DirectController();