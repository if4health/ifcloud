const Joi = require("joi");
const  ValidationError = require("../erros/ValidationError");

const schema = Joi.object({
    resourceType: Joi.string().required().messages({
        "any.required": "resourceType is required!",
        "string.base": "resourceType must be a string!"
    }),
    id: Joi.string().required().messages({
        "any.required": "id is required!",
        "string.base": "id must be a string!"
    }),
    scriptName: Joi.string().required().messages({
        "any.required": "scriptName is required!",
        "string.base": "scriptName must be a string!"
    }),
    returnOnlyFieldsComponents: Joi.boolean().required().messages({
        "any.required": "returnOnlyFieldsComponents is required!",
        "boolean.base": "returnOnlyFieldsComponents must be a boolean value!"
    }),
    components: Joi.array().min(1).items(
        Joi.object({
            index: Joi.number().integer().required().messages({
                "any.required": "index is required!",
                "number.base": "index must be a number!",
                "number.integer": "index must be an integer!"
            }),
            changeField: Joi.string().required().messages({
                "any.required": "changeField is required!",
                "string.base": "changeField must be a string!"
            })
        })
    ).required().messages({
        "any.required": "components is required!",
        "array.base": "components must be an array!",
        "array.min": "components must contain at least one item!"
    })
});

module.exports.operationStarterValidation = (data) => {
    const { error } = schema.validate(data, { abortEarly: false });
    
    if (error) {
        const messages = error.details.map((err) => {
            return { message: err.message }
        });

        throw new ValidationError(messages);
    }
};
