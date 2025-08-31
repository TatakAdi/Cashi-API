const express = require("express");
const { login } = require("../controller/login");
const { getUser } = require("../controller/getUser");
const { register } = require("../controller/register");
const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/user", authMiddleware, getUser);
router.post("/register", register);
router.post("/login", login);

module.exports = router;
