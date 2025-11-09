const AppError = require("./AppError");

class PythonScriptError extends AppError {
  constructor(message, statusCode = 500) {
    super(message, statusCode, "error");
  }
}

module.exports = PythonScriptError;
