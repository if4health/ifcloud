const AppError = require("./AppError");

class HandleError extends AppError {
    constructor(message, statusCode = 400) {
        super(message, statusCode, "error");
    }
}

module.exports = HandleError;