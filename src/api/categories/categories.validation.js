const Joi = require("joi");

const postCategorySchema = Joi.object({
  body: Joi.object({
    name: Joi.string().required(),
    type: Joi.string().valid("Expenses", "Income").required().messages({
      "any.only": "Type must be either Expenses or Income",
    }),
  }),
  query: Joi.object({}),
  params: Joi.object({}),
});
const putCategorySchema = Joi.object({
  body: Joi.object({
    name: Joi.string().required(),
    type: Joi.string().valid("Expenses", "Income").required().messages({
      "any.only": "Type must be either Expenses or Income",
    }),
  }),
  query: Joi.object({}),
  params: Joi.object({
    id: Joi.string()
      .pattern(/^category-[A-Za-z0-9_-]+$/)
      .required()
      .messages({
        "string.pattern.base": "Invalid category ID format",
        "any.required": "Category ID is required",
      }),
  }),
});

module.exports = { postCategorySchema, putCategorySchema };
