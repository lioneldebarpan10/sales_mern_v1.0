const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");
const { createPayment, getPaymentHistory, recordPaymentRecovery } = require("../controllers/payment.controller");

router.post("/", authMiddleware, createPayment);
router.get("/", authMiddleware, getPaymentHistory);
router.post("/:paymentId/recovery", authMiddleware, recordPaymentRecovery);

module.exports = router;