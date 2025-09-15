const chatModel = require("../models/chat.model");

async function newChat(req, res) {
  const { title } = req.body;
  const user = req.user;

  try {
    const newChat = await chatModel.create({
      user: user._id,
      title,
    });

    res.status(201).json({
      message: "new chat created successfully",
      chat: newChat,
    });
  } catch (error) {}
}
