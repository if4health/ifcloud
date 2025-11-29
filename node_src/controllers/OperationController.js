const {
  operationStarterValidation
} = require("../operations/validations/operationStarterValidation");
require("dotenv").config();

const OperationService = require("../services/OperationService");
const HandleServerError = require("../operations/erros/HandleServerError");
const AppError = require("../operations/erros/AppError");

class OperationController {
  async operationStarter(req, res) {
    try {
      // Form validations
      operationStarterValidation(req.body);

      const result = await OperationService.startOperation(req.body);

      return res.json(result);
    } catch (error) {
      // Inside api errors
      if (error instanceof AppError) {
        return res.status(error.statusCode).json(error.toJSON());
      }

      // Code errors
      if (error?.response?.data) {
        return res.status(400).json({
          status: "error",
          error: "ExternalAPIError",
          message: error.response.data.error ||
            error.response.data ||
            "External API returned an error",
        });
      }

      // Another possible errors
      console.log("External error:", error);
      const serverError = new HandleServerError(
        "An unexpected error occurred",
        500
      );
      return res.status(serverError.statusCode).json(serverError.toJSON());
    }
  }
}

module.exports = new OperationController();