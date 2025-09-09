const express = require("express");
const { authMiddleware } = require("../middleware/authMiddleware");
const { adminMiddleware } = require("../middleware/adminMiddleware");
const { getAllBudgetperUser, createBudget } = require("../controller/budget");

const router = express.Router();

router.get("/budget", authMiddleware, getAllBudgetperUser);
router.post("/budget", authMiddleware, createBudget);

module.exports = router;
