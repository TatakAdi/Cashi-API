const ValidationError = require("../exceptions/ValidationError");
const validateMiddleware = (schema) => {
  return (req, res, next) => {
    const options = {
      abortEarly: false,
      allowUnknown: false,
      stripUnknown: false,
    };
    const data = {
      body: req.body,
      query: req.query,
      params: req.params,
    };

    const { error, value } = schema.validate(data, options);

    if (error) {
      const details = error.details.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));

      throw new ValidationError("Validation Error", details);
    }

    req.body = value.body || {};
    req.query = value.query || {};
    req.params = value.params || {};
    next();
  };
};

module.exports = validateMiddleware;
