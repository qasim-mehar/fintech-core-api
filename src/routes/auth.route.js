const app = require("express");
const authController = require("../controllers/authController");
const router = app.Router();

router.post("/register", authController.registerUser);
router.post("/login", authController.loginUser);
router.post("/logout", authController.logoutUserController);

module.exports = router;
