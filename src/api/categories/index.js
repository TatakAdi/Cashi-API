const express = require("express");
const CategoryController = require("./categories.controller");
const validate = require("../../middleware/validateMiddleware");
const {
  postCategorySchema,
  putCategorySchema,
} = require("./categories.validation");

module.exports = ({ service, authMiddleware }) => {
  const router = express.Router();
  const controller = new CategoryController(service);

  router.post(
    "/",
    validate(postCategorySchema),
    authMiddleware,
    controller.postCategoryHandler,
  );
  router.get("/", authMiddleware, controller.getAllCategoryPerUserHandler);
  router.get("/:id", authMiddleware, controller.getOneCategoryByIdHandler);
  router.put(
    "/:id",
    validate(putCategorySchema),
    authMiddleware,
    controller.putCategoryByIdHandler,
  );
  router.delete("/:id", authMiddleware, controller.deleteCategoryByIdHandler);
  return router;
};
