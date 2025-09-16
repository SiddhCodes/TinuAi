const app = require("./src/app");
require("dotenv").config();
const connectDb = require("./src/db/db");

connectDb();
app.listen(process.env.PORT, () => {
  console.log("server start");
});
