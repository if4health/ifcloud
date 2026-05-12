const { spawnSync } = require("child_process");
const path = require("path");
const fs = require("fs");
const fsPromises = require("fs/promises");
const PythonScriptError = require("../operations/erros/PythonScriptError");

class PythonRunner {
  constructor() {
    this.scriptsDir = "./uploads_src";
    this.tempDir = path.join(this.scriptsDir, "temp");
  }

  async run(scriptName, params) {
    await this._verifyScriptExists(scriptName);
    return await this._execute(scriptName, params);
  }

  async _verifyScriptExists(scriptName) {
    const files = await fsPromises.readdir(this.scriptsDir);
    if (!files.includes(scriptName)) {
      throw new PythonScriptError(
        `Python script "${scriptName}" not found`,
        400
      );
    }
  }

  async _execute(scriptName, params) {
    /**
     * Check if directory exists
     * If dosen't exists, he it's created
     */
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }

    const timestamp = Date.now();
    const paramsFilePath = path.join(this.tempDir, `params_${timestamp}.txt`);
    console.log("[DEBUG] FilePath: " + paramsFilePath);

    try {
      // Write ECG data in file
      fs.writeFileSync(paramsFilePath, JSON.stringify(params), "utf8");

      /**
       * Execute python script and send the params(ECG data)
       * Needs to large buffer for tensorflow script
       * Atualy is 100MB for the buffer
       */
      const processResult = spawnSync(
        "python3",
        [path.join(this.scriptsDir, scriptName), paramsFilePath],
        { encoding: "utf8", maxBuffer: 1024 * 1024 * 100 }
      );

      const { stdout, stderr, status } = processResult;

      if (stderr) {
        stderr.trim().split("\n")
          .filter((line) => line.startsWith("[DEBUG]"))
          .forEach((line) => console.log(line));
      }

      // Verify if the scripts returns a ERROR
      if (status !== 0) {
        const cleanError = (stderr || stdout || "Unknown Python error")
          .trim()
          .split("\n")
          .pop();

        throw new PythonScriptError(cleanError, 500);
      }

      // Remove desnecessary prints (like TensorFlow logs) and get the last print, it's the necessary print to get the file with processed data
      const outputLines = stdout.trim().split("\n");
      const processedFilePath = outputLines[outputLines.length - 1].trim();

      console.log("[DEBUG] processedFilePath:", processedFilePath);

      if (!fs.existsSync(processedFilePath)) {
        throw new PythonScriptError(
          `Expected output file not found: ${processedFilePath}`
        );
      }

      const processedData = JSON.parse(
        fs.readFileSync(processedFilePath, "utf8")
      );

      return processedData;
    } catch (error) {
      throw new PythonScriptError(error.message);
    } finally {
      // Remove file from folder
      if (fs.existsSync(paramsFilePath)) {
        fs.unlinkSync(paramsFilePath);
      }
    }
  }
}

module.exports = new PythonRunner();
