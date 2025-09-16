const userModel = require("../models/user.model");
const bcrypt = require("bcrypt");
const { json } = require("express");
const jwt = require("jsonwebtoken");

// Register Controller
async function Register(req, res) {
  const {
    email,
    fullname: { firstName, lastName },
    password,
  } = req.body;
  try {
    const existingUser = await userModel.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        message: "user Already Exist",
      });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const newUser = await userModel.create({
      email,
      fullName: {
        firstName,
        lastName,
      },
      password: hashPassword,
    });

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_KEY);
    res.cookie("token", token);

    return res.status(201).json({
      message: "User created successfully",
      user: newUser,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
}

// Login Controller
async function Login(req, res) {
  const { email, password } = req.body;
  try {
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(401).json({
        message: "Invlid User",
      });
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({
        message: "Invalid Password",
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_KEY);
    res.cookie("token", token);
    return res.status(200).json({
      message: "Logged in successfully",
      user: user,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
}

// Logout Controller

// Export Auth Register
module.exports = { Register, Login };
