const chatModel = require("../models/chat.model");
const generateResponse = require("../services/ai.service");

async function newChat(req, res) {
  const userId = req.user._id;
  const { prompt } = req.body;

  try {
    const newChat = await chatModel.create({
      user: userId,
      messages: [{ sender: "user", content: prompt }],
    });

    const aiResponse = await generateResponse(prompt);

    newChat.messages.push({ sender: "ai", content: aiResponse });
    await newChat.save();

    return res.status(201).json({
      message: "New chat created.",
      newChat: newChat,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error during new chat creation.",
      error: error.message,
    });
  }
}
async function continueChat(req, res) {
  const userId = req.user._id;
  const { prompt } = req.body;
  const { chatId } = req.params;

  try {
    const existingChat = await chatModel.findOne({
      _id: chatId,
      user: userId,
    });

    if (!existingChat) {
      return res.status(404).json({ message: "Chat not found." });
    }

    existingChat.messages.push({ sender: "user", content: prompt });

    const conversationHistoryForGemini = existingChat.messages.map(
      (message) => {
        const role = message.sender === "user" ? "user" : "model";
        return {
          role: role,
          parts: [{ text: message.content }],
        };
      }
    );

    const aiResponse = await generateResponse(conversationHistoryForGemini);

    existingChat.messages.push({ sender: "ai", content: aiResponse });

    await existingChat.save();

    return res.status(200).json({
      message: "Chat continued successfully.",
      chat: existingChat,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error during chat continuation.",
      error: error.message,
    });
  }
}

module.exports = { newChat, continueChat };
