const ClientError = require("../exceptions/ClientError");

module.exports = (err, req, res, next) => {
  console.error(err);

  let statusCode = 500;
  let message = "Internal Server Error";
  let details;

  if (err instanceof ClientError) {
    statusCode = err.statusCode;
    message = err.message;
    details = err.details;
  }

  res.status(statusCode).json({
    status: "fail",
    message,
    ...(details && { details }),
  });
};
