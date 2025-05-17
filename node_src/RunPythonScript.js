const {
    execSync
} = require('child_process');
const path = require('path');
const fs = require('fs');
const fsPrimises = require('fs/promises');
const HandleError = require('./operations/erros/HandleError');
const { json } = require('body-parser');

module.exports = class RunPythonScript {
    async verifyScriptExists(scriptName) {
        const files = await fsPrimises.readdir('./uploads_src');
        if (!files.includes(scriptName)) {
            throw new HandleError(`Script "${scriptName}" not found`);
        }

        return true;
    }   

    runPythonScriptFromFile(scriptName, params) {

    }

    // runPythonScript(scriptName, params){
    //     try{
    //         var response = execSync(
    //             "python3 ./uploads_src/"+scriptName+" "+params,
    //             {encoding: "utf8" }
    //         );
    //         return response;
    //     }catch(e){
    //         console.log(e);
    //     }
    //     return false;
    // }

    async runPythonScript(scriptName, params) {
        //Caminho base para o upload
        const dirPath = './uploads_src/temp';
        //Pega o timestamp atual
        const timestamp = Date.now()
        //Caminho do diretório para armazenar o txt temporário
        const paramsFile = path.join(dirPath, `params_${timestamp}.txt`);

        try {
            //Verifica se o arquivo existe, se não ele é criado
            if (!fs.existsSync(dirPath)) {
                fs.mkdirSync(dirPath, {
                    recursive: true //Cria os diretórios caso não existam
                });
            }

            //Escreve no arquivo txt os dados dos parâmetros da função
            fs.writeFileSync(paramsFile, JSON.stringify(params), {
                encoding: 'utf8'
            });

            //Executa o script py 
            // Adicionar a linha abaixo após o 'encoding' para suportar saídas maiores de dados do script py
            //maxBuffer: 1024 * 1024 * 10
            const response = execSync(
                `python3 ./uploads_src/${scriptName} ${paramsFile}`, {
                    encoding: 'utf8'
                }
            );

            const processedFilePath = response.trim();
            const processedData = JSON.parse(fs.readFileSync(processedFilePath, 'utf8'));

            return processedData;
        } catch (e) {
            console.log(e);
        } finally {
            // console.log(paramsFile)
            //Quando tudo for executado sem erros, o arquivo txt temporário é excluído
            fs.unlinkSync(paramsFile);
        }
    }

    runPythonScriptNotParams(scriptName) {
        //Caminho base para o upload
        const dirPath = './uploads_src/temp';
        //Pega o timestamp atual
        const timestamp = Date.now()
        //Caminho do diretório para armazenar o txt temporário
        const paramsFile = path.join(dirPath, `params_${timestamp}.txt`);

        try {
            //Verifica se o arquivo existe, se não ele é criado
            if (!fs.existsSync(dirPath)) {
                fs.mkdirSync(dirPath, {
                    recursive: true //Cria os diretórios caso não existam
                });
            }

            fs.writeFileSync(paramsFile, '', {
                encoding: 'utf8'
            });

            //Executa o script py 
            // Adicionar a linha abaixo após o 'encoding' para suportar saídas maiores de dados do script py
            //maxBuffer: 1024 * 1024 * 10
            const response = execSync(
                `python3 ./uploads_src/${scriptName} ${paramsFile}`, {
                    encoding: 'utf8'
                }
            );

            const processedFilePath = response.trim();
            const processedData = JSON.parse(fs.readFileSync(processedFilePath, 'utf8'));
            return processedData;
        } catch (e) {
            console.log(e);
        }
         finally {
            // console.log(paramsFile)
            //Quando tudo for executado sem erros, o arquivo txt temporário é excluído
            fs.unlinkSync(paramsFile);
        }
    }
};