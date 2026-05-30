const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");
const { createPayment, getPaymentHistory } = require("../controllers/payment.controller");

router.post("/", authMiddleware, createPayment);
router.get("/", authMiddleware, getPaymentHistory);

module.exports = router;