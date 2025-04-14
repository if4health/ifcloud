const Joi = require("joi");
const  HandleArrayError = require("../erros/HandleArrayError");

const schema = Joi.object({
    resourceType: Joi.string().required().messages({
        "any.required": "resourceType is required!",
        "string.base": "resourceType must be a string!"
    }),
    resourceId: Joi.string().required().messages({
        "any.required": "id is required!",
        "string.base": "id must be a string!"
    }),
    scriptName: Joi.string().required().messages({
        "any.required": "scriptName is required!",
        "string.base": "scriptName must be a string!"
    }),
    onlyComponent: Joi.boolean().required().messages({
        "any.required": "returnOnlyFieldsComponents is required!",
        "boolean.base": "returnOnlyFieldsComponents must be a boolean value!"
    }),
    componentIndex: Joi.array().items(
            Joi.number().integer().required().messages({
                "number.base": "componentIndex must be a number!",
                "number.integer": "componentIndex must be an integer!",
                "any.required": "componentIndex is required!"
            })
        ).min(1).required().messages({
            "any.required": "componentIndex is required!",
            "array.base": "componentIndex must be an array!",
            "array.min": "componentIndex must contain at least one value!"
        }),
    changeField: Joi.array().items(
            Joi.string().required().messages({
                "string.base": "changeField must be a string!",
                "any.required": "changeField is required!"
            })
        ).min(1).required().messages({
            "any.required": "changeField is required!",
            "array.base": "changeField must be an array!",
            "array.min": "changeField must contain at least one value!"
        })
});

module.exports.validateForm = (data) => {
    const { error } = schema.validate(data, { abortEarly: false });

    if (error) {
        const errorText = error.details.map(detail => `- ${detail.message}`).join('<br>');

        throw new Error(errorText);
    }
};
