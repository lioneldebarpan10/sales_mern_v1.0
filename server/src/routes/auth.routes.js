const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");
const { registerAdmin, loginAdmin, getCurrentAdmin, logoutAdmin } = require("../controllers/auth.controller");

router.post("/register", registerAdmin);
router.post("/login", loginAdmin);
router.get("/me", authMiddleware, getCurrentAdmin);
router.post("/logout", authMiddleware, logoutAdmin);

module.exports = router;