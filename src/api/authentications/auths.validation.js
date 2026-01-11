const Joi = require("joi");

const loginSchema = Joi.object({
  body: Joi.object({
    identity: Joi.string().required(),
    password: Joi.string().required(),
  }),
  query: Joi.object({}),
  params: Joi.object({}),
});

const refreshTokenSchema = Joi.object({
  body: Joi.object({
    refreshToken: Joi.string().required(),
  }),
  query: Joi.object({}),
  params: Joi.object({}),
});

const logoutSchema = Joi.object({
  body: Joi.object({
    refreshToken: Joi.string().required(),
  }),
  query: Joi.object({}),
  params: Joi.object({}),
});

module.exports = { loginSchema, refreshTokenSchema, logoutSchema };
