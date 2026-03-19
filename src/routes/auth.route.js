const app = require("express");
const authController = require("../controllers/authController");
const router = app.Router();
router.post("/register", authController.registerUser);
module.exports = router;
