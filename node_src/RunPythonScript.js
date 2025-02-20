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
            const response = execSync(
                `python3 ./uploads_src/${scriptName} ${paramsFile}`, {
                    encoding: 'utf8',
                    maxBuffer: 1024 * 1024 * 10
                }
            );

            console.log(JSON.parse(response));
            
            return false;
            // console.log(JSON.parse(response)[0]);
            // return response;
            // console.log(JSON.parse(response[0]));
            // return false;
            // const jsonResponse = response.replace(/'/g, '"').trim();
            // console.log(JSON.parse(jsonResponse));
            // return jsonResponse;

            // const processedFilePath = response.trim();
            // const filename = processedFilePath.split('/').pop();
            // const files = await fsPrimises.readdir('./uploads_src/temp');
            // console.log(files.includes(filename));
            // processedData = JSON.parse(fs.readFileSync(processedFilePath, 'utf8'));

            const processedData = fs.readFile(`./uploads_src/temp/${filename}`, 'utf8');
console.log(processedData);

            return false;
            
            // try {
            //     // Verifica se o arquivo existe
            //     if (fs.existsSync(processedFilePath)) {
            //         console.log('Arquivo encontrado:', processedFilePath);
            
            //         // Tenta ler o arquivo
            //         const processedData = fs.readFileSync(processedFilePath, 'utf8');
            //         console.log('Conteúdo do arquivo:', processedData);
            //     } else {
            //         console.error('Erro: Arquivo não encontrado no caminho:', processedFilePath);
            //     }
            // } catch (error) {
            //     console.error('Erro ao acessar o arquivo:', error.message);
            // }


            // const processedData = (fs.readFileSync(processedFilePath, 'utf8'));
            // console.log(processedData);
            
            // return false;
            
            return processedData;
        } catch (e) {
            console.log(e);
        } finally {
            // console.log(paramsFile)
            //Quando tudo for executado sem erros, o arquivo txt temporário é excluído
            // fs.unlinkSync(paramsFile);
        }
        return false;
    }

    runPythonScriptNotParams(scriptName) {
        try {
            var response = execSync(
                `python3 ./uploads_src/${scriptName}`, {
                    encoding: 'utf8'
                }
            );
            return response;
        } catch (e) {
            console.error('Error:', e.message);
            return false;
        }
    }
};