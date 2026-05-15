const { spawnSync } = require("child_process");
const path = require("path");
const fs = require("fs");
const fsPromises = require("fs/promises");
const PythonScriptError = require("../operations/erros/PythonScriptError");

class PythonRunner {
  constructor() {
    this.scriptsDir = "./uploads_src";
    this.tempDir = path.join(this.scriptsDir, "temp");
    // Use the Python executable defined in .env, defaulting to "python3"
    this.pythonExecutable = process.env.PYTHON_EXECUTABLE || "python3";
  }

  /**
   * Validates and executes a Python script
   *
   * @param {string} scriptName - Name of the Python script to execute.
   * @param {object} params - Data to be passed to the script.
   * @returns {Promise<object>} Parsed JSON output produced by the script.
   * @throws {PythonScriptError} If the script is not found or execution fails.
   */
  async run(scriptName, params) {
    await this._verifyScriptExists(scriptName);
    return await this._execute(scriptName, params);
  }

  /**
   * Checks if the requested script exists in the scripts directory.
   *
   * @param {string} scriptName - Name of the Python script file to look for.
   * @throws {PythonScriptError} 400 if the script file is not found.
   */
  async _verifyScriptExists(scriptName) {
    const files = await fsPromises.readdir(this.scriptsDir);
    if (!files.includes(scriptName)) {
      throw new PythonScriptError(
        `Python script "${scriptName}" not found`,
        400
      );
    }
  }

  /**
   * Writes params to a temp file, runs the Python script via spawnSync,
   *
   * @param {string} scriptName - Name of the Python script
   * @param {object} params - Data to be passed to the script.
   * @returns {object} Parsed JSON data from the script output file.
   * @throws {PythonScriptError} 500 if execution fails or output file is missing.
   */
  async _execute(scriptName, params) {
    // Create temp directory if it doesn't exist
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
        this.pythonExecutable,
        [path.join(this.scriptsDir, scriptName), paramsFilePath],
        { encoding: "utf8", maxBuffer: 1024 * 1024 * 100 }
      );

      const { stdout, stderr, status } = processResult;

      // Forward only [DEBUG] lines from Python to Node console
      if (stderr) {
        stderr
            .trim()
            .split("\n")
            .filter((line) => 
              line.startsWith("[DEBUG]") ||
              line.startsWith("[INFO]"))
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

      // The last line of stdout is the output file path printed by the script
      const outputLines = stdout.trim().split("\n");
      const processedFilePath = outputLines[outputLines.length - 1].trim();
      console.log("[DEBUG] processedFilePath:", processedFilePath);

      if (!fs.existsSync(processedFilePath)) {
        throw new PythonScriptError(
          `Expected output file not found: ${processedFilePath}`,
          500
        );
      }

      return JSON.parse(fs.readFileSync(processedFilePath, "utf8"));
    } catch (error) {
      if (error instanceof PythonScriptError) {
        throw error;
      }

      throw new PythonScriptError(error.message, 500);
    } finally {
      // Remove file from folder
      if (fs.existsSync(paramsFilePath)) {
        fs.unlinkSync(paramsFilePath);
      }
    }
  }
}

module.exports = new PythonRunner();
