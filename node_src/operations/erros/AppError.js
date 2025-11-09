class AppError extends Error {
  constructor(message, statusCode = 400, status = "error") {
    super(message);
    this.name = this.constructor.name;
    this.status = status;
    this.statusCode = statusCode;
  }

  toJSON() {
    return {
      status: this.status,
      error: this.name,
      message: this.message,
    };
  }
}

module.exports = AppError;
