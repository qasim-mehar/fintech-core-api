const accountModel = require("../models/account.model");

async function createAccountController(req, res) {
  const user = req.user;
  const account = await accountModel.create({
    user: user._id,
  });
  re.status(201).json({
    message: "Acoount created successfully",
    account,
  });
}

module.exports = { createAccountController };
