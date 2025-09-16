const express = require("express");
const router = express.Router();
const isValidToken = require("../middlewares/auth.middleware");
const chatController = require("../controllers/chat.controller");

router.post("/", isValidToken, chatController.newChat);
router.post("/", isValidToken, chatController.continueChat);

module.exports = router;
