const app = require("./src/app");
require("dotenv").config();
const connectDb = require("./src/db/db");
const socketServer = require("./src/sockets/socket.io");
const http = require("http").createServer(app);

socketServer(http);
connectDb();
http.listen(process.env.PORT, () => {
  console.log("server start");
});
