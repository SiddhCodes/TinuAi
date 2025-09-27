const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const cookie = require("cookie");
const userModel = require("../models/user.model");
const chatModel = require("../models/chat.model");
const { generateAiResponse, summarizeAiResponse } = require("./ai.service");
const { saveMemory, retrieveMemory } = require("./pinecone.service");

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
        let chat;
        if (chatId) {
          chat = await chatModel.findById(chatId);
        } else {
          chat = await chatModel.create({ user: userId, messageHistory: [] });
        }
        chat.messageHistory.push({ sender: "user", message: prompt });
        const memoryContext = await retrieveMemory(userId.toString(), prompt);
        let currentChatHistory = chat.messageHistory.map((content) => {
          const role = content.sender === "user" ? "user" : "model";
          return {
            role: role,
            parts: [{ text: content.message }],
          };
        });
        const messageHistoryForGemini = [];
        if (memoryContext) {
          messageHistoryForGemini.push({
            role: "user",
            parts: [{ text: memoryContext }],
          });
        }
        messageHistoryForGemini.push(...currentChatHistory);
        const AiResponse = await generateAiResponse(messageHistoryForGemini);
        chat.messageHistory.push({ sender: "model", message: AiResponse });
        if (chat.messageHistory.length >= 4) {
          const allHistoryForGemini = chat.messageHistory.map((content) => {
            const role = content.sender === "user" ? "user" : "model";
            return {
              role: role,
              parts: [{ text: content.message }],
            };
          });
          allHistoryForGemini.push({
            role: "user",
            parts: [
              {
                text: "Please analyze the entire conversation history provided above and generate the comprehensive, structured memory summary exactly as specified in your system instructions. Do not add any introductory phrases, just start with the summary.",
              },
            ],
          });
          const summary = await summarizeAiResponse(allHistoryForGemini);
          await saveMemory(userId.toString(), summary);
          chat.messageHistory = [];
          await chat.save();
        }
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