const mongoose = require("mongoose");
const substockistModel = require("../models/substockist.model");
const paymentModel = require("../models/payment.model");

async function createSubstockist(req, res) {
   try {
      const { substockistId, firstName, middleName, lastName, phone, email, address } = req.body

      // step -1 validate request
      if (!substockistId || !firstName || !lastName || !phone) {
         return res.status(400).json({
            message: "Fields are required"
         })
      }

      // step - 2 check for duplicate substockist
      const normalizedId = substockistId.toUpperCase();

      const isExists = await substockistModel.findOne({
         substockistId: normalizedId
      });

      if (isExists) {
         return res.status(400).json({
            message: "Substockist ID already exists"
         })
      }

      // step - 3 create a substockist
      const newSubStockist = await substockistModel.create({
         substockistId: normalizedId,
         firstName,
         middleName,
         lastName,
         phone,
         email,
         address
      })

      res.status(201).json({
         message: "Substockist Created successfully",
         data: newSubStockist
      })

   }
   catch (error) {
      console.log("Create Substockist Error:", error.message);
      res.status(500).json({ message: "Internal Server Error" });
   }
}

async function getAllSubstockists(req, res) {
   try {
      const { search } = req.query
      let query = {};

      if (search) {
         query = {
            $or: [
               { substockistId: { $regex: search, $options: "i" } },
               { firstName: { $regex: search, $options: "i" } },
               { lastName: { $regex: search, $options: "i" } }
            ]
         };
      }

      const substockists = await substockistModel.find(query).sort({ createdAt: -1 });

      res.status(200).json({
         count: substockists.length,
         data: substockists
      });

   }
   catch (error) {
      console.log("Fetch Substockist error: ", error.message)
      res.status(500).json({ message: "Internal Server error" })
   }
}

async function getSubstockistById(req, res) {
   try {
      const { id } = req.params;
      let substockist = null;

      if (mongoose.Types.ObjectId.isValid(id)) {
         substockist = await substockistModel.findById(id);
      }
      if (!substockist) {
         substockist = await substockistModel.findOne({ substockistId: id.toUpperCase() });
      }

      if (!substockist) {
         return res.status(404).json({ message: "Substockist not found" });
      }

      const now = new Date();
      const yearStart = new Date(now.getFullYear(), 0, 1);
      const yearEnd = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);

      const summaryResult = await paymentModel.aggregate([
         {
            $match: {
               substockist: substockist._id,
               paymentDate: {
                  $gte: yearStart,
                  $lte: yearEnd
               }
            }
         },
         {
            $group: {
               _id: null,
               total: { $sum: "$totalAmount" },
               paid: { $sum: "$paidAmount" },
               due: { $sum: "$dueAmount" }
            }
         }
      ]);

      const weeklyHistory = await paymentModel.aggregate([
         {
            $match: {
               substockist: substockist._id,
               paymentDate: {
                  $gte: yearStart,
                  $lte: yearEnd
               }
            }
         },
         {
            $project: {
               paidAmount: 1,
               dueAmount: 1,
               totalAmount: 1,
               weekOfYear: { $isoWeek: "$paymentDate" }
            }
         },
         {
            $group: {
               _id: "$weekOfYear",
               total: { $sum: "$totalAmount" },
               paid: { $sum: "$paidAmount" },
               due: { $sum: "$dueAmount" }
            }
         },
         { $sort: { _id: 1 } }
      ]);

      const monthlyHistory = await paymentModel.aggregate([
         {
            $match: {
               substockist: substockist._id,
               paymentDate: {
                  $gte: yearStart,
                  $lte: yearEnd
               }
            }
         },
         {
            $project: {
               paidAmount: 1,
               dueAmount: 1,
               totalAmount: 1,
               month: { $month: "$paymentDate" }
            }
         },
         {
            $group: {
               _id: "$month",
               total: { $sum: "$totalAmount" },
               paid: { $sum: "$paidAmount" },
               due: { $sum: "$dueAmount" }
            }
         },
         { $sort: { _id: 1 } }
      ]);

      res.status(200).json({
         substockist,
         summary: summaryResult[0] || { total: 0, paid: 0, due: 0 },
         weeklyHistory,
         monthlyHistory
      });
   } catch (error) {
      console.log("Get Substockist Profile Error:", error.message);
      res.status(500).json({ message: "Internal Server error" });
   }
}

module.exports = {
   createSubstockist,
   getAllSubstockists,
   getSubstockistById
}