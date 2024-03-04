const { execSync } = require('child_process');
const fs = require('fs');

module.exports = class RunPythonScript {
 
    runPythonScriptFromFile(scriptName, params) {

    }

    runPythonScript(scriptName, params){
        try{
            var response = execSync(
                "python ./uploads_src/"+scriptName+" "+params,
                {encoding: "utf8" }
            );
            return response;
        }catch(e){
            console.log(e);
        }
        return false;
    }

    runPythonScriptNotParams(scriptName) {
        try {
            var response = execSync(
                `python ./uploads_src/${scriptName}`,
                { encoding: 'utf8' }
            );
            return response;
        } catch (e) {
            console.error('Error:', e.message);
            return false;
        }
    }
};
