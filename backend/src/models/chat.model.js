const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const messageSchema = new Schema(
  {
    sender: {
      type: String,
      enum: ["user", "model", "system"],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const chatSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    messageHistory: [messageSchema],
  },
  {
    timestamps: true,
  }
);
const chatModel = mongoose.model("Chat", chatSchema);
module.exports = chatModel;