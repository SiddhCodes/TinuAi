const app = require("./src/app");
require("dotenv").config()
const connectDb = require("./src/db/db")


connectDb()
app.listen(process.env.port,()=>{
    console.log("server start");
})
