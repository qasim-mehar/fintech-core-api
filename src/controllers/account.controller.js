const accountModel = require("../models/account.model");

async function createAccountController(req, res) {
  const user = req.user;
  const account = await accountModel.create({
    user: user._id,
  });
  res.status(201).json({
    message: "Account created successfully",
    account,
  });
}

async function getUserAccountsController(req, res) {
  const userId = req.user._id;
  const accounts = await accountModel.find({
    user: userId,
  });
  res.status(200).json({
    message: "User accounts fetched",
    accounts,
  });
}

module.exports = {
  createAccountController,
  getUserAccountsController,
};
