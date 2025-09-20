const app = require("./src/app");
const connectDb = require("./src/db/db");
const http = require("http").createServer(app);
const socketServer = require("./src/services/socket.service");

socketServer(http);

connectDb();
http.listen(3000, () => {
  console.log("Server is running on 3000");
});
