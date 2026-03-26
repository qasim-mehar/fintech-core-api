const authMiddleware = require("../middleware/auth.middleware");
const transationController = require("../controllers/transaction.controller");
const { Router } = require("express");
const transactionRoutes = Router();

// transactionRoutes.post("/");
transactionRoutes.post(
  "/system/initial-funds",
  authMiddleware.authSystemUserMiddleware,
  transationController.createInitialFundsTransaction,
);

module.exports = transactionRoutes;
