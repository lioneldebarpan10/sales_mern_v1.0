const express = require("express")
const router = express.Router()
const authMiddleware = require("../middleware/auth.middleware")
const { createSubstockist, getAllSubstockists, getSubstockistById } = require("../controllers/substockist.controller");

// Protected routes of substockists
router.post("/" , authMiddleware , createSubstockist)
router.get("/:id", authMiddleware, getSubstockistById)
router.get("/" , authMiddleware , getAllSubstockists)

module.exports = router