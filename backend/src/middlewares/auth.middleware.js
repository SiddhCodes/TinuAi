const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");

async function isValidToken(req, res, next) {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({
        message: "Authentication token missing.",
      });
    }
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    req.user = await userModel.findById(decoded.id);

    if (!req.user) {
      return res.status(404).json({ message: "User not found." });
    }

    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
}

module.exports = isValidToken;
