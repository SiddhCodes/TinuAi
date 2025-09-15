const mongoose = require("mongoose");

async function connectDb() {
  try {
    await mongoose.connect(process.env.mongodb_uri);
    console.log("connected to MongoDb");
  } catch (error) {
    console.log("connection faild to MongoDB:", error);
  }
}

module.exports = connectDb;
