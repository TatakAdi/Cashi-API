const express = require("express");
const TransactionController = require("./transactions.controller");
const validate = require("../../middleware/validateMiddleware");

module.exports = ({ service, authMiddleware }) => {
  const router = express.Router();
  const controller = new TransactionController(service);

  router.post("/", authMiddleware, controller.postTransactionHandler);
  router.get("/", authMiddleware, controller.getTransactionsHandler);
  router.get("/:id", authMiddleware, controller.getTransactionByIdHandler);
  router.put("/:id", authMiddleware, controller.putTransactionByIdHandler);
  router.delete(
    "/:id",
    authMiddleware,
    controller.deleteTransactionByIdHandler,
  );
  return router;
};
