const express = require("express");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const app = express();

app.use(express.json());
app.use(cookieParser());
/**
 * - Routes require
 */
const authRoute = require("./routes/auth.route");
const accountRoute = require("../src/routes/account.route");

/**
 * - use routes
 */
app.use("/api/auth", authRoute);
app.use("/api/accounts", accountRoute);

module.exports = app;
