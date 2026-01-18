const express = require("express");
const CategoryController = require("./categories.controller");

module.exports = ({ service, authMiddleware }) => {
  const router = express.Router();
  const controller = new CategoryController(service);

  router.post("/", authMiddleware, controller.postCategoryHandler);
  router.get("/", authMiddleware, controller.getAllCategoryPerUserHandler);
  router.get("/:id", authMiddleware, controller.getOneCategoryByIdHandler);
  return router;
};
