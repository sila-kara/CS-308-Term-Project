const router = require("express").Router();
const { register, login, getMe, updateMe, forgotPassword, resetPassword } = require("../controllers/authController");
const { authMiddleware } = require("../middleware/auth");

router.post("/register", register);
router.post("/login", login);
router.get("/me", authMiddleware, getMe);
router.patch("/me", authMiddleware, updateMe);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

module.exports = router;
