const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");
const emailService = require("../services/email.service");

//js doc comment
/**
 * - user register controller
 * - POST /api/auth/register
 */
async function registerUser(req, res) {
  const { name, email, password } = req.body;
  const isUserAlreadyExist = await userModel.findOne({ email });
  if (isUserAlreadyExist) {
    return res.status(422).json({
      message: "User with this email already exist",
      status: "failed",
    });
  }

  const user = await userModel.create({
    name,
    email,
    password,
  });
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: "3d",
  });
  res.cookie("token", token);

  res.status(201).json({
    message: "User created successfuly",
    user: {
      _id: user._id,
      email: user.email,
      name: user.name,
    },
    token,
  });
  console.log(process.env.EMAIL_USER, process.env.CLIENT_ID);
  await emailService.sendRegistraionEmail(user.name, user.email);
}
/**
 * - POST api/auth/login
 * -user login controller
 */
async function loginUser(req, res) {
  const { email, password } = req.body;
  const user = await userModel.findOne({ email }).select("+password");
  if (!user) {
    return res.status(401).json({
      message: "Email or password is invalid",
      status: "failed",
    });
  }
  const isValidePassword = await user.comparePassword(password);

  if (!isValidePassword) {
    return res.status(401).json({
      message: "Email or password is invalid",
      status: "failed",
    });
  }
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: "3d",
  });
  res.cookie("token", token);
  res.status(200).json({
    message: "user login successfull",
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
  });
}
module.exports = { registerUser, loginUser };
