const {
    validateFormRunScriptWithParams,
} = require("../operations/validations/runScriptWithParamsValidation");
const DirectService = require("../services/DirectService");
const AppError = require("../operations/erros/AppError");
const HandleServerError = require("../operations/erros/HandleServerError");

class DirectController {
    async runScriptWithParams(req, res) {
        try {
            validateFormRunScriptWithParams(req.body);

            const result = await DirectService.startDirect(req.body);
            return res.json(result);
        } catch (error) {
            // Inside api error
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

module.exports = new DirectController();