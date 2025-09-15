const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");

async function isValidToken(req, res, next) {
  try {
    const key = req.cookies.key;
    if (!key) {
      return res.status(401).json({
        message: "key not valid!",
      });
    }
    const decodedKey = jwt.verify(key, process.env.jwt_key);

    const user = await userModel.findById(decodedKey.id);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    res.user = user;

    next();
  } catch (error) {}
}

module.exports = isValidToken;
