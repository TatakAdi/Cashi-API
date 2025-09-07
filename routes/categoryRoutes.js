const express = require("express");
const { authMiddleware } = require("../middleware/authMiddleware");
const { adminMiddleware } = require("../middleware/adminMiddleware");
const {
  getAllCategory,
  getAllCategoryperUser,
  getOneCategoryperUser,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controller/category");

const router = express.Router();

router.get("/allCategory", authMiddleware, adminMiddleware, getAllCategory);
router.get("/category", authMiddleware, getAllCategoryperUser);
router.get("/category/:id", authMiddleware, getOneCategoryperUser);
router.post("/category", authMiddleware, createCategory);
router.put("/category/:id", authMiddleware, updateCategory);
router.delete("/category/:id", authMiddleware, deleteCategory);

module.exports = router;
