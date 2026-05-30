const express = require("express")
const router = express.Router()
const authMiddleware = require("../middleware/auth.middleware")
const { createSubstockist, getAllSubstockists, getSubstockistById, deleteSubstockist } = require("../controllers/substockist.controller");

// Protected routes of substockists
router.post("/" , authMiddleware , createSubstockist)
router.delete("/:id", authMiddleware, deleteSubstockist)
router.get("/:id", authMiddleware, getSubstockistById)
router.get("/" , authMiddleware , getAllSubstockists)

module.exports = router