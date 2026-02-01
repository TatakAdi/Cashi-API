const express = require("express");
const BudgetController = require("./budget.controller");
const validate = require("../../middleware/validateMiddleware");

module.exports = ({ service, authMiddleware }) => {
  const router = express.Router();
  const controller = new BudgetController(service);

  router.post(
    "/",

    authMiddleware,
    controller.postBudgetHandler,
  );
  // router.get("/", authMiddleware, controller.getAllCategoryPerUserHandler);
  // router.get("/:id", authMiddleware, controller.getOneCategoryByIdHandler);
  // router.put(
  //   "/:id",
  //   validate(putCategorySchema),
  //   authMiddleware,
  //   controller.putCategoryByIdHandler,
  // );
  // router.delete("/:id", authMiddleware, controller.deleteCategoryByIdHandler);
  return router;
};
