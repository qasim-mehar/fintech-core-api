const mongoose = require("mongoose");
const accountSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "user",
      //To make searching fast using P+ tree
      index: true,
    },
    status: {
      type: String,
      enum: {
        values: ["ACTIVE, FROZEN, CLOSED"],
        message: "status can be either ACTIVE, FROZEN OR CLOSED",
        default: "ACTIVE",
      },
    },
    currency: {
      type: String,
      default: "USD",
    },
  },
  {
    timestamps: true,
  },
);
accountSchema.index({ user: 1, status: 1 });
const accountModel = mongoose.model("account", accountSchema);
module.exports = accountModel;
