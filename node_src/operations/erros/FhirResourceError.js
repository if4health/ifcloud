const AppError = require("./AppError");

class FhirResourceError extends AppError {
  constructor(message, statusCode = 422) {
    super(message, statusCode, "fail");
  }
}

module.exports = FhirResourceError;
