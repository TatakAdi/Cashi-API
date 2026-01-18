const express = require("express");
const CategoryController = require("./categories.controller");

module.exports = ({ service, authMiddleware }) => {
  const router = express.Router();
  const controller = new CategoryController(service);

  router.post("/", authMiddleware, controller.postCategoryHandler);
  return router;
};
