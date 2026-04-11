const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");
const accountModel = require("../models/account.model");
const tokenBlacklistModel = require("../models/blackList.model");
async function authUserMiddleware(req, res, next) {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({
      message: "unauthorized",
    });
  }
  const isTokenBlacklisted = await tokenBlacklistModel.findOne({
    token,
  });
  if (isTokenBlacklisted) {
    return res.status(400).json({
      message: "Unauthorized access, token is invalid",
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
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  const isTokenBlacklisted = await tokenBlacklistModel.findOne({
    token,
  });
  if (isTokenBlacklisted) {
    return res.status(400).json({
      message: "Unauthorized access, token is invalid",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const id = decoded.userId;
    const user = await userModel.findById(id).select("+systemUser");

    if (!user.systemUser) {
      return res.status(403).json({
        message: "Forbidden access, you are not a system user",
      });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }
}
module.exports = { authUserMiddleware, authSystemUserMiddleware };
