const express = require("express");
const { authMiddleware } = require("../middleware/authMiddleware");
const { adminMiddleware } = require("../middleware/adminMiddleware");
const {
  getAllTransactionperUser,
  getOneTransactionperUser,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} = require("../controller/transaksi");

const router = express.Router();

router.get("/transaction", authMiddleware, getAllTransactionperUser);
router.get("/transaction/:id", authMiddleware, getOneTransactionperUser);
router.post("/transaction", authMiddleware, createTransaction);
router.put("/transaction/:id", authMiddleware, updateTransaction);
router.delete("/transaction/:id", authMiddleware, deleteTransaction);
module.exports = router;
