const PythonRunner = require("../providers/PythonRunner")

class DirectService {
    async startDirect(body) {
        const { scriptName, params } = body

        const processedData = await PythonRunner.run(scriptName, params)
        return processedData
    }
}

module.exports = new DirectService()