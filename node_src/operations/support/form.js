const HandleError = require("../erros/HandleError");
const runScript = require("../../RunPythonScript");
const fsPrimises = require('fs/promises');

module.exports.getComponentChangeForm = (components, index) => {
    if (Array.isArray(components) && components[index] && components[index].valueSampledData) {
        return components[index].valueSampledData;
    }
    throw new Error("Index or changeField does not exists!");
    // return [false, "Index or changeField does not exists!"];
}

module.exports.getDataFromComponentForm = (componentChange, changeField) => {
    if (componentChange[changeField]) {
        return componentChange[changeField];
    }
    throw new Error("ChangeField does not exists!");
    // return [false, "ChangeField does not exists!"];
}

module.exports.processComponentChangeForm = async (components, scriptName) => {
    const fileExists = await verifyScriptExists(scriptName);
    if (!fileExists) {
        throw new Error(`Script "${scriptName}" not found`);
        // return [false, `Script "${scriptName}" not found`];
    }

    const scriptReturned = await runScriptPython(scriptName, components);
    if (!scriptReturned) {
        throw new Error("Python script return error");
        // return [false, "Python script return error"];
    }

    return scriptReturned;
}

async function runScriptPython(scriptName, data) {
    const run = new runScript();
    const scriptResult = run.runPythonScript(scriptName, data);
    return scriptResult;
}

async function verifyScriptExists(scriptName) {
    const files = await fsPrimises.readdir('./uploads_src');
    
    if (files.includes(scriptName)) {
        return true;
    }

    return false;
}