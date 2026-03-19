const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");

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
}
module.exports = { registerUser };
