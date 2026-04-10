const transactionModel = require("../models/transaction.model");
const ledgerModel = require("../models/leadger.model");
const accountModel = require("../models/account.model");
const emailService = require("../services/email.service");
const { default: mongoose } = require("mongoose");

async function createTransationController(req, res) {
  const { toAccount, fromAccount, amount, idempotencyKey } = req.body;
  if (!toAccount || !fromAccount || !amount || !idempotencyKey) {
    return res.status(400).json({
      message: "toAccount, amount and idemptoncyKey are required",
    });
  }
  const toUserAccount = await accountModel.findOne({ _id: toAccount });
  if (!toUserAccount) {
    return res.status(400).json({
      message: "Account not found to send transaction",
    });
  }
  const fromUserAccount = await accountModel.findOne({ _id: fromAccount });
  if (!fromUserAccount) {
    return res.status(400).json({
      message: "Create a account first to make a transaction",
    });
  }
  const isIdempotencyKeyExist = await transactionModel.findOne({
    idempotencyKey,
  });
  if (isIdempotencyKeyExist) {
    if (isIdempotencyKeyExist.status == "COMPLETED") {
      return res.status(200).json({
        message: "Transaction already processed",
        transaction: isIdempotencyKeyExist,
      });
    }
    if (isIdempotencyKeyExist.status == "PENDING") {
      return res.status(200).json({
        message: "Transaction is still processing",
      });
    }
    if (isIdempotencyKeyExist.status == "FAILED") {
      return res.status(500).json({
        message: "Transaction processing failed",
      });
    }
    if (isIdempotencyKeyExist.status == "REVERSED") {
      return res.status(200).json({
        message: "Transaction was reversed, please try again",
      });
    }
  }

  if (toUserAccount.status !== "ACTIVE") {
    return res.status(500).json({
      message: "User account is CLOSED or Frozen",
    });
  }
  if (fromUserAccount.status !== "ACTIVE") {
    return res.status(500).json({
      message: "Your account is CLOSED or Frozen",
    });
  }

  const balance = await fromUserAccount.getBalance();

  if (balance < amount) {
    return res.status(400).json({
      message: `Insufficient balance. Current balance is ${balance}, Requested amount is ${amount}`,
    });
  }

  const session = await mongoose.startSession();
  //ITS A MONGO DB's BUILT IN METHOD TO MAKE SURE A TRANSACTION IS COMPLETED,
  //IT WILL MAKE SURE EITHER ALL PART FROM CREATING A TRANSACTION TO MARK TRANSACTION COMPLETED SHOULD BE REGISTER IN DB OR NOTHING REGISTER
  try {
    session.startTransaction();

    const transaction = (
      await transactionModel.create(
        [
          {
            fromAccount,
            toAccount,
            status: "PENDING",
            amount,
            idempotencyKey,
          },
        ],
        { session },
      )
    )[0];

    console.log(transaction);
    const debitLedgerEntry = await ledgerModel.create(
      [
        {
          account: fromAccount,
          type: "DEBIT",
          amount,
          transaction: transaction._id,
        },
      ],
      { session },
    );

    const creditLedgerEntry = await ledgerModel.create(
      [
        {
          account: toAccount,
          type: "CREDIT",
          amount,
          transaction: transaction._id,
        },
      ],
      { session },
    );

    await transactionModel.findOneAndUpdate(
      { _id: transaction._id },
      { status: "COMPLETED" },
      { session },
    );

    await session.commitTransaction();
    session.endSession();

    emailService.sendTransactioSuccessEmail({
      account: req.user.email,
      name: req.user.name,
      amount,
      toAccount,
    });

    res.status(201).json({
      message: "Transaction Successfull",
      transaction,
    });
  } catch (error) {
    await session.abortTransaction();

    res.status(400).json({
      message: "Transaction is pending due to some issues, please wait",
    });
  } finally {
    session.endSession();
  }
}
async function createInitialFundsTransaction(req, res) {
  const { toAccount, amount, idempotencyKey } = req.body;
  if (!toAccount || !amount || !idempotencyKey) {
    return res.status(400).json({
      message: "toAccount, amount and idemptoncyKey are required",
    });
  }

  const toUserAccount = await accountModel.findOne({
    _id: toAccount,
  });

  if (!toUserAccount) {
    return res.status(400).json({
      message: "Account not found to send transaction",
    });
  }
  const fromSystemUserAccount = await accountModel.findOne({
    user: req.user._id,
  });
  if (!fromSystemUserAccount) {
    return res.status(403).json({
      message: "Unauthorized",
    });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  const transaction = new transactionModel({
    fromAccount: fromSystemUserAccount._id,
    toAccount: toUserAccount._id,
    status: "PENDING",
    amount,
    idempotencyKey,
  });

  const debitLedgerEntry = await ledgerModel.create(
    [
      {
        account: fromSystemUserAccount._id,
        type: "DEBIT",
        amount,
        transaction: transaction._id,
      },
    ],
    { session },
  );
  const creditLedgerEntry = await ledgerModel.create(
    [
      {
        account: toUserAccount._id,
        type: "CREDIT",
        amount,
        transaction: transaction._id,
      },
    ],
    { session },
  );

  transaction.status = "COMPLETED";
  await transaction.save({ session });
  await session.commitTransaction();
  session.endSession();

  res.status(201).json({
    message: "Initial funds transaction completed successfully",
    transaction: transaction,
  });
}

module.exports = {
  createTransationController,
  createInitialFundsTransaction,
};
