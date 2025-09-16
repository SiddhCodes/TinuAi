const express = require("express");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/auth.routes");
const chatRoutes = require("./routes/chat.routes");

const app = express();
// Middlewares
app.use(express.json());
app.use(cookieParser());

// Auth Routes
app.use("/api/auth", authRoutes);
app.use("/api/newchat", chatRoutes);
app.use("/api/:chatId", chatRoutes);

module.exports = app;
