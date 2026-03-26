const mongoose = require("mongoose");
const transactionSchema = new mongoose.Schema(
  {
    fromAccount: {
      type: mongoose.Schema.ObjectId,
      ref: "account",
      require: [true, "transaction must be associated with a from account"],
      index: true,
    },
    toAccount: {
      type: mongoose.Schema.ObjectId,
      ref: "account",
      require: [true, "transaction must be associated with a from account"],
      index: true,
    },
    status: {
      type: String,
      enum: {
        values: ["COMPLETED", "PENDING", "REVERSED", "FAILED"],
        message:
          "status must be either completed, pending, reversed, or failed",
      },
      default: "PENDING",
    },
    amount: {
      type: Number,
      required: [true, "Amount is required to make a transaction"],
      min: [0, "Transaction ammount can't be negative"],
    },
    /**
     * - It prevent to make a transaction happen more than once
     * - It always genrate at client side not server side
     */
    idempotencyKey: {
      type: String,
      required: [true, "Idempotency Key is required to make a transaction"],
      unique: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);
const transactionModel = mongoose.model("transaction", transactionSchema);
module.exports = transactionModel;
