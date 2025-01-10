const apiRequest = require("../ApiRequest");
const runScript = require("../RunPythonScript");
const path = require('path');
const { getComponentChange, processComponentChange, getDataFromComponent } = require("../operations/support/operationStarterSupport");
const { validateFormOperationStarter } = require("../operations/validations/operationStarterValidation");
const { log } = require("console");
const { validateForm } = require("../operations/validations/validationForm");
const { getComponentChangeForm, processComponentChangeForm, getDataFromComponentForm } = require("../operations/support/form");
const fs = require('fs').promises;


class OperationController{
    async operationStarter(req, res){
        try{

            validateFormOperationStarter(req.body);

            const { resourceType, id, scriptName, returnOnlyFieldsComponents, components } = req.body;
            
            const { data } = await apiRequest.get(resourceType+'/'+id);

            const fhirComponents = data.component;
            const arrFilteredComponents = [];
            const arrDataComponents = [];
            const arrComponentsChanges = [];
            
            for(const component of components) {
                const componentChange = getComponentChange(fhirComponents, component.index);
                arrComponentsChanges.push(componentChange);
                arrDataComponents.push(getDataFromComponent(componentChange, component));
            }

            const processedData = await processComponentChange(arrDataComponents, scriptName);

            components.forEach((component, index) => {
                arrComponentsChanges[index][component.changeField] = processedData[index].join(" ").replace(/(\r\n|\n|\r)/gm, "");
                
                if (returnOnlyFieldsComponents) {
                    arrFilteredComponents.push(arrComponentsChanges[index]);
                }
            });
            
            return res.json(returnOnlyFieldsComponents ? arrFilteredComponents : data);

        }catch(e){
            return res.status(e.statusCode || 500).json(e || "Internal server error");
        }
    }

    async myForm(req, res){
        try{
            req.body.onlyComponent = req.body.onlyComponent !== "0";

            const errors = validateForm(req.body);
            if (errors) {
                return res.send(`Validation Errors:<br> ${errors}`);
            }

            const { resourceType, resourceId, scriptName, componentIndex, changeField, onlyComponent } = req.body;

            const { data } = await apiRequest.get(resourceType+'/'+resourceId);
            
            const fhirComponents = data.component;
            const arrFilteredComponents = [];
            const arrComponentsChanges = [];
            const arrDataComponents = [];
            let response = {
                "resourceType": resourceType,
                 "id": ""+resourceId,
                 "scriptName": scriptName,
                 "returnOnlyFieldsComponent": onlyComponent,
                 "components": []
            }

            for (let fieldIndex = 0; fieldIndex < changeField.length; fieldIndex++) {
                const componentChange = getComponentChangeForm(fhirComponents, componentIndex[fieldIndex]);
                if (Array.isArray(componentChange) && !componentChange[0]) {
                    return res.send(componentChange[1]);
                }

                response.components.push({
                    "index": componentIndex[fieldIndex],
                    "changeField": changeField[fieldIndex],
                    "originalComponent": componentChange[changeField[fieldIndex]]
                });

                arrComponentsChanges.push(componentChange);
                const dataFromComponent = getDataFromComponentForm(componentChange, changeField[fieldIndex]);
                if (Array.isArray(dataFromComponent) && !dataFromComponent[0]) {
                    return res.send(dataFromComponent[1]);
                }
                arrDataComponents.push(dataFromComponent);

            }

            const processedData = await processComponentChangeForm(arrDataComponents, scriptName);

            for (let fieldIndex = 0; fieldIndex < changeField.length; fieldIndex++) {
                arrComponentsChanges[fieldIndex][changeField[fieldIndex]] = processedData[fieldIndex].join(" ").replace(/(\r\n|\n|\r)/gm, "");

                if (onlyComponent) {
                    arrFilteredComponents.push(arrComponentsChanges[fieldIndex]);
                }
            }

            if(onlyComponent){
                return res.render('form_example', {data: arrFilteredComponents, response});
            }

            return res.send({...data});
        }catch(e){
            console.log(e);
            return res.send("Internal server error");
            // return res.status(e.statusCode || 500).json(e || "Internal server error");
        }
    }

    static async createTXT(content) {
        const directoryPath = path.join(__dirname, '..', 'texto_ecg');
        const filePath = path.join(directoryPath, 'ECG.TXT');
    
        try {
            // Verifica se o diretório existe, cria se não existir
            await fs.mkdir(directoryPath, { recursive: true });
    
            // Verifica se o arquivo existe
            try {
                await fs.access(filePath);
                // Se existir, substitui o conteúdo
                await fs.writeFile(filePath, content);
                console.log('Arquivo ecg foi modificado', filePath);
            } catch (err) {
                // Se não existir, cria o arquivo
                await fs.writeFile(filePath, content);
                console.log('Arquivo ecg foi criado', filePath);
            }
        } catch (error) {
            console.error('Erro ao modificar ou criar o arquivo ecg.txt', error);
        }
    }
}




module.exports = new OperationController();
