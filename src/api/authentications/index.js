const express = require("express");
const AuthController = require("./auths.controller");
const validate = require("../../middleware/validateMiddleware");

const {
  loginSchema,
  refreshTokenSchema,
  logoutSchema,
} = require("./auths.validation");

module.exports = ({ service }) => {
  const router = express.Router();
  const controller = new AuthController(service);

  router.post("/login", validate(loginSchema), controller.loginHandler);
  router.post(
    "/refresh",
    validate(refreshTokenSchema),
    controller.refreshTokenVerifyHandler
  );
  router.post("/logout", validate(logoutSchema), controller.logoutHandler);
  return router;
};
