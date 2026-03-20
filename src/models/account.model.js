const mongoose = require("mongoose");
const accountSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "user",
    },
    status: {
      enum: {
        values: ["ACTIVE, FROZEN, CLOSED"],
        message: "status can be either ACTIVE, FROZEN OR CLOSED",
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

const accountModel = mongoose.model("account", accountSchema);
module.exports = accountModel;
