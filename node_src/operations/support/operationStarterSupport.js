const HandleError = require("../erros/HandleError");
const runScript = require("../../RunPythonScript");
const fs = require('fs/promises');

module.exports.getComponentChange = (components, index) => {
    if (components[index]) {
        return components[index]['valueSampledData'];
    }
    throw new HandleError('Index does not exists!');
}

module.exports.processComponentChange = async (components, scriptName) => {
    const scriptReturned = await runScriptPython(scriptName, components);
    if (!scriptReturned) {
        throw new HandleError("Python script return error");
    }

    return scriptReturned;
}

module.exports.getDataFromComponent = (componentChange, userComponent) => {
    if (componentChange[userComponent.changeField]) {
        return componentChange[userComponent.changeField];
    }
    throw new HandleError("ChangeField does not exists!");
}

async function runScriptPython(scriptName, components) {
    const run = new runScript();
    await run.verifyScriptExists(scriptName);
    const scriptResult = run.runPythonScript(scriptName, components);
    
    return scriptResult;
}
