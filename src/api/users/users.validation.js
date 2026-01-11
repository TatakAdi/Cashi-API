const Joi = require("joi");

const registerSchema = Joi.object({
  body: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    username: Joi.string().required(),
    fullname: Joi.string().required(),
  }),
  query: Joi.object({}),
  params: Joi.object({}),
});

module.exports = { registerSchema };
