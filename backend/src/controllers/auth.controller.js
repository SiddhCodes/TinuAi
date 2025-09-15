const userModel = require("../models/user.model");
const bycript = require("bcrypt");
const { json } = require("express");
const jwt = require("jsonwebtoken");

// Register Controller
async function Register(req, res) {
  try {
    const {
      email,
      fullname: { firstName, lastName },
      password,
    } = req.body;

    const existingUser = await userModel.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        message: "user Already Exist",
      });
    }

    const hashPassword = bycript.hash(password, 10);

    const newUser = await userModel.create({
      email,
      fullName: {
        firstName,
        lastName,
      },
      password: hashPassword,
    });

    const key = jwt.sign({ id: newUser._id }, process.env.jwt_key);
    res.cookies("key", key);

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
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(401).json({
        message: "Invlid User",
      });
    }

    const validPassword = await bycript.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({
        message: "Invalid Password",
      });
    }

    const key = jwt.sign({ id: user._id }, process.env.jwt_key);
    res.cookies("key", key);
    res.status(200),
      json({
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
