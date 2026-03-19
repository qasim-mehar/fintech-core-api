const mongoose = require("mongoose");

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Database connected successfully");
  } catch (err) {
    console.log("Database connection failed");
    process.exit(1);
  }
}
module.exports = connectDB;
