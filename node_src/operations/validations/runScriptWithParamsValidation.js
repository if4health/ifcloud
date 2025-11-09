const Joi = require("joi");
const ValidationError = require("../erros/ValidationError");

const schema = Joi.object({
    scriptName: Joi.string().required().messages({
        "any.required": "scriptName is required!",
        "string.base": "scriptName must be a string!"
    }),
    params: Joi.array().min(1).required().messages({
        "any.required": "params is required!",
        "array.base": "params must be an array!",
        "array.min": "components must contain at least one item!"
    })
});

module.exports.validateFormRunScriptWithParams = (data) => {
    const { error } = schema.validate(data, { abortEarly: false });
    
    if (error) {
        const messages = error.details.map((err) => {
            return { message: err.message }
        });
        ValidationError
        throw new ValidationError(messages);
    }
};
