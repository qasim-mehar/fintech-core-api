const app = require("express");
const authController = require("../controllers/authController");
const router = app.Router();
router.post("/register", authController.registerUser);
router.post("/login", authController.loginUser);
module.exports = router;
