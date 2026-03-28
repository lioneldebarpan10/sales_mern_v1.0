const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");
const { createPayment } = require("../controllers/payment.controller");

router.post("/", authMiddleware, createPayment);

module.exports = router;