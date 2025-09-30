const express = require("express");
const { authMiddleware } = require("../middleware/authMiddleware");
const {
  changePassword,
  updateAmount,
  editFullname,
} = require("../controller/user");

const router = express.Router();

router.put("/user/password", authMiddleware, changePassword);
router.put("/user/amount", authMiddleware, updateAmount);
router.put("/user/fullname", authMiddleware, editFullname);

module.exports = router;
