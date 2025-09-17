const express = require("express");
const router = express.Router();
const isValidToken = require("../middlewares/auth.middleware");
const chatController = require("../controllers/chat.controller");

router.post("/new", isValidToken, chatController.newChat);
router.post("/:chatId", isValidToken, chatController.continueChat);

module.exports = router;
