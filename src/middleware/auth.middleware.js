const jwt = require("jsonwebtoken");
const accountModel = require("../models/account.model");
async function authMiddleware(req, res, next) {
  const token = req.cookie.token || req.header.authentication?.split(" ")[1];
  if (!token) {
    return res.status(401).json({
      message: "unauthorized",
    });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const id = decoded.id;
    const user = await accountModel.findById(id);
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      message: "unauthorized",
    });
  }
}
module.exports = authMiddleware;
