const express = require("express");
const { authMiddleware } = require("../middleware/authMiddleware");
const { adminMiddleware } = require("../middleware/adminMiddleware");
const {
  getAllBudgetperUser,
  getOneBudgetperUser,
  createBudget,
  updateBudget,
  deleteBudget,
} = require("../controller/budget");

const router = express.Router();

router.get("/budget", authMiddleware, getAllBudgetperUser);
router.get("/budget/:id", authMiddleware, getOneBudgetperUser);
router.post("/budget", authMiddleware, createBudget);
router.put("/budget/:id", authMiddleware, updateBudget);
router.delete("/budget/:id", authMiddleware, deleteBudget);

module.exports = router;
