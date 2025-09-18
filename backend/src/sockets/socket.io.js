const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");
function socketServer(http) {
  const io = new Server(http);

  io.use(async (socket, next) => {
    const token = socket.handshake.headers.token;

    if (!token) {
      return next(new Error("Authentication error: Token format is invalid."));
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_KEY);
      const user = await userModel.findById(decoded.id);
      socket.user = user;
    } catch (error) {
      return res.status(401).json({
        message: "Unauthorized user",
        error: error.message,
      });
    }
    next();
  });

  io.on("connection", (socket) => {
    console.log("new socket server connecting", socket.id);
  });
}

module.exports = socketServer;
