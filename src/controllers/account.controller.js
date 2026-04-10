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

async function getUserBalanceController(req, res) {
  const { accountId } = req.params;
  const userId = req.user._id;
  const userAccount = await accountModel.findOne({
    _id: accountId,
    user: userId,
  });
  if (!userAccount) {
    return res.status(400).json({
      message: "Account not found",
    });
  }
  const totalBalance = await userAccount.getBalance();
  res.status(200).json({
    message: "Account balance fetched",
    account: accountId,
    totalBalance,
  });
}
module.exports = {
  createAccountController,
  getUserAccountsController,
  getUserBalanceController,
};
