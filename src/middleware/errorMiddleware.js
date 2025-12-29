const ClientError = require("../exceptions/ClientError");

module.exports = (err, req, res, next) => {
  console.error(err);

  let statusCode = 500;
  let message = "Internal Server Error";

  if (err instanceof ClientError) {
    statusCode = err.statusCode;
    message = err.message;
  }

  res.status(statusCode).json({
    status: "fail",
    message,
  });
};
