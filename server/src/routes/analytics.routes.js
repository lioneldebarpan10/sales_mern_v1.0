const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");

const {
   getSummary,
   getWeeklyAnalytics,
   getMonthlyAnalytics,
   getYearlyAnalytics
} = require("../controllers/analytics.controller");

router.get("/summary", authMiddleware, getSummary);
router.get("/weekly", authMiddleware, getWeeklyAnalytics);
router.get("/monthly", authMiddleware, getMonthlyAnalytics);
router.get("/yearly", authMiddleware, getYearlyAnalytics);

module.exports = router;