const express = require("express");
const authController = require("../controllers/auth.controller");

const router = express.Router();

router.post("/register", authController.Register);
router.post("/login", authController.Login);
router.post("/logout", authController.logout);

module.exports = router;
