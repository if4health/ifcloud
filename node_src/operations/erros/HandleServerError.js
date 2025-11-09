const AppError = require("./AppError");

class HandleServerError extends AppError {
  constructor(message = "Internal server error", statusCode = 500) {
    super(message, statusCode, "error");
  }
}

module.exports = HandleServerError;
