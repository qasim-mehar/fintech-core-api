const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");
async function authMiddleware(req, res, next) {
  const token = req.cookies.token || req.header.authentication?.split(" ")[1];
  if (!token) {
    return res.status(401).json({
      message: "unauthorized",
    });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const id = decoded.userId;
    const user = await userModel.findById(id);
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      message: "unauthorized",
    });
  }
}
module.exports = authMiddleware;
