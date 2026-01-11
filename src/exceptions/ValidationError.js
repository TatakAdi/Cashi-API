const ClientError = require("./ClientError");

class ValidationError extends ClientError {
  constructor(message, details = []) {
    super(message);
    this.name = "ValidationError";
    this.details = details;
  }
}

module.exports = ValidationError;
