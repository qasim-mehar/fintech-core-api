const mongoose = require("mongoose");
const ledgerSchema = new mongoose.Schema({
  account: {
    type: mongoose.Schema.ObjectId,
    ref: "account",
    required: [true, "Account is required to make a ledger entry"],
    immutable: true,
    index: true,
  },
  type: {
    type: String,
    enum: {
      values: ["CREDIT, DEBIT"],
      message: "Transaction type can be either CREDIT or DEBIT",
    },
    required: [true, "Transation type is required to create a ledger"],
    immutable: true,
  },
  transaction: {
    type: mongoose.Schema.ObjectId,
    ref: "transaction",
    required: [true, "Transaction info is required to make a ledger"],
    immutable: true,
    index: true,
  },
});

function preventLedgerModification() {
  throw new Error("Ledger entries can't be modified or deleted");
}

ledgerSchema.pre("findOneAndDelete", preventLedgerModification);
ledgerSchema.pre("updateMany", preventLedgerModification);
ledgerSchema.pre("updateOne", preventLedgerModification);
ledgerSchema.pre("remove", preventLedgerModification);
ledgerSchema.pre("deleteMany", preventLedgerModification);
ledgerSchema.pre("deleteOne", preventLedgerModification);

const ledgerModel = mongoose.model("ledger", ledgerSchema);
module.exports = ledgerModel;
