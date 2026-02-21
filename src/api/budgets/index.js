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
  router.get("/", authMiddleware, controller.getBudgetsperUserHandler);
  router.get("/:id", authMiddleware, controller.getOneBudgetByIdperUserHandler);
  router.put("/:id", authMiddleware, controller.putBudgetByIdHandler);
  router.delete("/:id", authMiddleware, controller.deleteBudgetByIdHandler);
  return router;
};
