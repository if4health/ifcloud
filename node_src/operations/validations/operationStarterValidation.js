const Joi = require("joi");
const ValidationError = require("../erros/ValidationError");

const byIdSchema = Joi.object({
  typeRequest: Joi.string().valid("byId").required(),
}).unknown(true);

const byIdAndMinuteSchema = Joi.object({
  typeRequest: Joi.string().valid("byIdAndMinute").required(),
  minute: Joi.number().integer().min(1).required().messages({
    "any.required": "minute is required for byIdAndMinute!",
    "number.base":  "minute must be a number!",
    "number.min":   "minute must be greater than 0!",
  }),
}).unknown(true);

const byIdAndMinuteIntervalSchema = Joi.object({
  typeRequest: Joi.string().valid("byIdAndMinuteInterval").required(),
  initialMinute: Joi.number().integer().min(1).required().messages({
    "any.required": "initialMinute is required for byIdAndMinuteInterval!",
    "number.base":  "initialMinute must be a number!",
    "number.min":   "initialMinute must be greater than 0!",
  }),
  finalMinute: Joi.number().integer().min(1).required().messages({
    "any.required": "finalMinute is required for byIdAndMinuteInterval!",
    "number.base":  "finalMinute must be a number!",
    "number.min":   "finalMinute must be greater than 0!",
  }),
}).unknown(true)
  .custom((value, helpers) => {
    if (value.finalMinute <= value.initialMinute) {
      return helpers.error("interval.invalid");
    }
    return value;
  }).messages({
    "interval.invalid": "finalMinute must be greater than initialMinute!",
  });

/**
 * Maps each typeRequest value to its specific Joi schema.
 * To add a new type, register a new entry here.
 */
const typeRequestSchemas = {
  byId:                  byIdSchema,
  byIdAndMinute:         byIdAndMinuteSchema,
  byIdAndMinuteInterval: byIdAndMinuteIntervalSchema,
};

// Base schema shared by all request types.
// Extra fields (minute, initialMinute, finalMinute) are allowed via unknown(true)
// and validated separately by the typeRequest-specific schema.
const baseSchema = Joi.object({
  resourceType: Joi.string().required().messages({
    "any.required": "resourceType is required!",
    "string.base":  "resourceType must be a string!",
  }),
  id: Joi.string().required().messages({
    "any.required": "id is required!",
    "string.base":  "id must be a string!",
  }),
  scriptName: Joi.string().required().messages({
    "any.required": "scriptName is required!",
    "string.base":  "scriptName must be a string!",
  }),
  returnOnlyFieldsComponents: Joi.boolean().required().messages({
    "any.required": "returnOnlyFieldsComponents is required!",
    "boolean.base": "returnOnlyFieldsComponents must be a boolean value!",
  }),
  typeRequest: Joi.string()
    .valid("byId", "byIdAndMinute", "byIdAndMinuteInterval")
    .required()
    .messages({
      "any.required": "typeRequest is required!",
      "string.base":  "typeRequest must be a string!",
      "any.only":     "typeRequest must be one of: byId, byIdAndMinute, byIdAndMinuteInterval!",
    }),
  components: Joi.array().min(1).items(
    Joi.object({
      index: Joi.alternatives()
        .try(Joi.number().integer(), Joi.string())
        .required()
        .messages({
          "any.required": "index is required!",
          "alternatives.match": "index must be a number or a string code!",
        }),
      changeField: Joi.string().required().messages({
        "any.required": "changeField is required!",
        "string.base":  "changeField must be a string!",
      }),
    })
  ).required().messages({
    "any.required": "components is required!",
    "array.base":   "components must be an array!",
    "array.min":    "components must contain at least one item!",
  }),
}).unknown(true); // permite campos extras (minute, initialMinute, finalMinute)


/**
 * Validates the request body and the
 * typeRequest-specific schema. Collects all errors from both passes
 * before throwing, so the caller receives a complete error list.
 *
 * @param {Object} data - Request body
 * @param {string} data.resourceType - Resource type identifier.
 * @param {string} data.id - Resource ID.
 * @param {string} data.scriptName - Name of the Python script
 * @param {boolean} data.returnOnlyFieldsComponents - Whether to return only field components.
 * @param {"byId"|"byIdAndMinute"|"byIdAndMinuteInterval"} data.typeRequest - Request strategy type.
 * @param {Array<{index: number|string, changeField: string}>} data.components - List of components to process.
 * @throws {ValidationError} If any base or type-specific validation rule fails.
 */
module.exports.operationStarterValidation = (data) => {
  const errors = [];

  // Step 1: validate fields required by all request types  
  const baseResult = baseSchema.validate(data, { abortEarly: false });
  if (baseResult.error) {
    baseResult.error.details.forEach((err) => errors.push({ message: err.message }));
  }

  // Step 2: validate fields specific to the given typeRequest (if recognized)  
  const typeSchema = typeRequestSchemas[data?.typeRequest];
  if (typeSchema) {
    const typeResult = typeSchema.validate(data, { abortEarly: false });
    if (typeResult.error) {
      typeResult.error.details.forEach((err) => errors.push({ message: err.message }));
    }
  }

  if (errors.length > 0) {
    throw new ValidationError(errors);
  }
};