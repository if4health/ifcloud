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



// const FhirApi = require("../providers/FhirApi");
// const HandleError = require("../errors/HandleError");
// // Caso o PythonRunner já exista
// const PythonRunner = require("./PythonRunnerService");

// class OperationService {
//     async startOperation(body) {
//         const { resourceType, id, scriptName, returnOnlyFieldsComponents, components } = body;

//         // 1. Busca o recurso FHIR
//         const resource = await FhirApi.get(`${resourceType}/${id}`);

//         const fhirComponents = resource.component;
//         if (!fhirComponents) {
//             throw new HandleError("Resource does not contain components");
//         }

//         // 2. Mapeia componentes para enviar ao Python
//         const { arrComponentsChanges, arrDataComponents } = this._mapComponentsToData(fhirComponents, components);

//         // 3. Executa script Python e recebe dados tratados
//         const processedData = await PythonRunner.run(scriptName, arrDataComponents);

//         // 4. Aplica alterações aos componentes
//         const finalComponents = this._applyProcessedValues(arrComponentsChanges, components, processedData);

//         // 5. Retorna resultado
//         return returnOnlyFieldsComponents ? finalComponents : resource;
//     }

//     // ========== Métodos privados de negócio ========== //

//     _getComponentChange(components, index) {
//         if (!components[index]) {
//             throw new HandleError(`Component index (${index}) does not exist`);
//         }
//         return components[index];
//     }

//     _getValueSampledDataByIndex(components, index) {
//         if (components[index] && components[index]["valueSampledData"]) {
//             return components[index]["valueSampledData"];
//         }
//         throw new HandleError("valueSampledData does not exist!");
//     }

//     _getDataFromChangeField(component, changeComponent) {
//         if (component[changeComponent.changeField]) {
//             return component[changeComponent.changeField];
//         }
//         throw new HandleError("ChangeField does not exist!");
//     }

//     _mapComponentsToData(fhirComponents, components) {
//         const arrComponentsChanges = [];
//         const arrDataComponents = [];

//         for (const comp of components) {
//             const componentChange = this._getComponentChange(fhirComponents, comp.index);
//             arrComponentsChanges.push(componentChange);
//             arrDataComponents.push(this._getDataFromChangeField(componentChange, comp));
//         }

//         return { arrComponentsChanges, arrDataComponents };
//     }

//     _applyProcessedValues(arrComponentsChanges, components, processedData) {
//         return arrComponentsChanges.map((comp, index) => {
//             const rawValue = processedData[index];
//             const normalizedValue = Array.isArray(rawValue) ? rawValue.join(" ") : rawValue;

//             comp[components[index].changeField] = normalizedValue?.toString().replace(/(\r\n|\n|\r)/gm, "");

//             return comp;
//         });
//     }
// }

// module.exports = new OperationService();
