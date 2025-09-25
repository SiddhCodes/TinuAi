const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const cookie = require("cookie");
const userModel = require("../models/user.model");
const chatModel = require("../models/chat.model");
const { generateAiResponse } = require("./ai.service");
const { saveMemory, retrieveMemory } = require("./pinecone.service");
const { generateEmbedding } = require("../services/ai.service");
const { json } = require("express");

function socketServer(http) {
  const io = new Server(http, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });
  io.use(async (socket, next) => {
    const token = cookie.parse(socket.handshake.headers.cookie || "").token;

    if (!token) {
      return next(new Error("Authentication error: Token not provided."));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await userModel.findById(decoded.id);

      if (!user) {
        return next(new Error("Authentication error: User not found."));
      }
      socket.user = user;

      next();
    } catch (error) {
      console.error("JWT Verification Error:", error.message);
      next(new Error("Authentication error: Invalid or expired token."));
    }
  });
  io.on("connection", async (socket) => {
    socket.on("userPrompt", async (data) => {
      const userId = socket.user._id;
      const parsedData = typeof data === "string" ? JSON.parse(data) : data;
      const { chatId, prompt } = parsedData;
      try {
        // await saveMemory(userId, prompt);
        let chat;
        let context = "";
        if (chatId) {
          chat = await chatModel.findById(chatId);
        } else {
          chat = await chatModel.create({ user: userId, messageHistory: [] });
          // context = await retrieveMemory(userId, prompt);
        }
        chat.messageHistory.push({ sender: "user", message: prompt });

        if (chat.messageHistory.length > 20) {
          chat.messageHistory = chat.messageHistory.slice(-10);
          await chat.save();
        }

        const messageHistoryForGemini = chat.messageHistory.map((content) => {
          const role = content.sender === "user" ? "user" : "model";
          return {
            role: role,
            parts: [{ text: content.message }],
          };
        });

        const finalPrompt = context
          ? [
              {
                role: "user",
                parts: [{ text: context + "\n" + "\nQuestion:" + prompt }],
              },
              ...messageHistoryForGemini,
            ]
          : messageHistoryForGemini;

        const AiResponse = await generateAiResponse(finalPrompt);
        // await saveMemory(userId, AiResponse);
        chat.messageHistory.push({ sender: "model", message: AiResponse });

        socket.emit("aiResponse", {
          response: AiResponse,
          chatID: chat._id,
        });

        await chat.save();
      } catch (error) {
        socket.emit(
          "error",
          "An internal server error occurred. Please try again."
        );
      }
    });
    socket.on("disconnect", () => {
      console.log("User disconnected");
    });
  });
}

module.exports = socketServer;
