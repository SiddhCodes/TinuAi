const express = require("express");
const authRoutes = require("./routes/auth.routes");

const app = express();
// Middlewares
app.use(express.json());

// Auth Routes
app.use("api/auth", authRoutes);

module.exports = app;
