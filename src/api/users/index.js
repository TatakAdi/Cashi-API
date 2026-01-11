const express = require("express");
const UsersController = require("./users.controller");
const validate = require("../../middleware/validateMiddleware");
const { registerSchema } = require("./users.validation");

module.exports = ({ service, authMiddleware }) => {
  const router = express.Router();
  const controller = new UsersController(service);

  router.post("/", validate(registerSchema), controller.registerHandler);

  router.get("/me", authMiddleware, controller.getUserProfileHandler);

  return router;
};
