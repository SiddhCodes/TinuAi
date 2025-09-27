const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

async function register(req, res) {
  const { fullName, email, password } = req.body;
  const { firstName, lastName } = fullName;
  try {
    const existUser = await userModel.findOne({ email });

    if (existUser) {
      return res.status(409).json({ message: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await userModel.create({
      fullName: {
        firstName,
        lastName,
      },
      email,
      password: hashedPassword,
    });
    const jwtToken = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    res.cookie("token", jwtToken);
    return res
      .status(201)
      .json({ message: "User registered successfully!", newUser: newUser });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
}

async function login(req, res) {
  const { email, password } = req.body;
  try {
    const existUser = await userModel.findOne({ email });
    if (!existUser) {
      return res.status(401).json({
        message: "Invlid User",
      });
    }
    const isValidPassword = await bcrypt.compare(password, existUser.password);
    if (!isValidPassword) {
      return res.status(401).json({
        message: "Invalid Password",
      });
    }
    const jwtToken = jwt.sign({ id: existUser._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    res.cookie("token", jwtToken);
    return res.status(200).json({
      message: "Logged in successfully",
      user: existUser,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
}

async function logout(req, res) {
  try {
    res.clearCookie("token");
    return res.status(200).json({
      message: "Logged out successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error during logout.",
      error: error.message,
    });
  }
}

module.exports = {
  register,
  login,
  logout,
};
