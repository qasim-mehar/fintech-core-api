const mongoose = reqiure("mongoose");
const tokenBlacklistSchema = new mongoose.Schema({
  token: {
    type: String,
    required: [true, "Token is required"],
    unique: [true, "Token should be unique"],
  },
});
tokenBlacklistSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 60 * 60 * 24 * 3 }, //3 days
);

const tokenBlacklistModel = mongoose.model(
  "tokenBlackList",
  tokenBlacklistSchema,
);
module.exports = tokenBlacklistModel;
