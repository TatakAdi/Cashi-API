const express = require("express");
const DashboardController = require("./dashboard.controller");

module.exports = ({ service, authMiddleware }) => {
  const router = express.Router();
  const controller = new DashboardController(service);

  router.get(
    "/transactions",
    authMiddleware,
    controller.getDashboardTransactionHandler,
  );
  router.get("/budgets", authMiddleware, controller.getDashboardBudgetsHandler);
  return router;
};
