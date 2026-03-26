const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");
async function authUserMiddleware(req, res, next) {
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
async function authSystemUserMiddleware(req, res, next) {
  const token = req.cookies.token || req.header.authorization.split(" ")[1];
  if (!token) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const id = decoded.userId;
    const user = await userModel.findById(id).select("+systemUser");
    if (!user.systenUser) {
      return res.status(403).json({
        message: "Forbidden access, you are not a system user",
      });
    }

    body.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }
}
module.exports = { authUserMiddleware, authSystemUserMiddleware };
