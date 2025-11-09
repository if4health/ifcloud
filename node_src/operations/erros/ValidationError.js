const AppError = require("./AppError");

class ValidationError extends AppError {
  constructor(messages, statusCode = 400) {
    super("Validation Error", statusCode, "fail");
    this.messages = messages;
  }

  toJSON() {
    return {
      status: this.status,
      error: this.name,
      messages: this.messages
    };
  }
}

module.exports = ValidationError;
