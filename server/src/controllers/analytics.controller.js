const paymentModel = require("../models/payment.model");
const substockistModel = require("../models/substockist.model");

async function getSummary(req, res) {
   try {
      const result = await paymentModel.aggregate([
         {
            $group: {
               _id: null,
               total: { $sum: "$totalAmount" },
               paid: { $sum: "$paidAmount" },
               due: { $sum: "$dueAmount" }
            }
         }
      ]);

      const activeCount = await substockistModel.countDocuments();

      res.status(200).json({
         data: result[0] || { total: 0, paid: 0, due: 0 },
         activeCount
      });
   } catch (error) {
      console.log("Summary Error:", error.message);
      res.status(500).json({ message: "Internal Server error" });
   }
}

async function getWeeklyAnalytics(req, res) {
   try {
      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setHours(0, 0, 0, 0);
      startOfWeek.setDate(now.getDate() - now.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);

      const result = await paymentModel.aggregate([
         {
            $match: {
               paymentDate: {
                  $gte: startOfWeek,
                  $lte: endOfWeek
               }
            }
         },
         {
            $group: {
               _id: { $dayOfWeek: "$paymentDate" },
               total: { $sum: "$totalAmount" },
               paid: { $sum: "$paidAmount" },
               due: { $sum: "$dueAmount" }
            }
         },
         { $sort: { "_id": 1 } }
      ]);

      res.status(200).json({ data: result });
   } catch (error) {
      console.log("Weekly Analytics Error:", error.message);
      res.status(500).json({ message: "Internal Server error" });
   }
}

async function getMonthlyAnalytics(req, res) {
   try {
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

      const result = await paymentModel.aggregate([
         {
            $match: {
               paymentDate: {
                  $gte: monthStart,
                  $lte: monthEnd
               }
            }
         },
         {
            $project: {
               paidAmount: 1,
               dueAmount: 1,
               totalAmount: 1,
               weekOfMonth: {
                  $ceil: {
                     $divide: [{ $dayOfMonth: "$paymentDate" }, 7]
                  }
               }
            }
         },
         {
            $group: {
               _id: "$weekOfMonth",
               total: { $sum: "$totalAmount" },
               paid: { $sum: "$paidAmount" },
               due: { $sum: "$dueAmount" }
            }
         },
         { $sort: { "_id": 1 } }
      ]);

      res.status(200).json({ data: result });
   } catch (error) {
      console.log("Monthly Analytics Error:", error.message);
      res.status(500).json({ message: "Internal Server error" });
   }
}

async function getYearlyAnalytics(req, res) {
   try {
      const now = new Date();
      const yearStart = new Date(now.getFullYear(), 0, 1);
      const yearEnd = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);

      const result = await paymentModel.aggregate([
         {
            $match: {
               paymentDate: {
                  $gte: yearStart,
                  $lte: yearEnd
               }
            }
         },
         {
            $group: {
               _id: { $month: "$paymentDate" },
               total: { $sum: "$totalAmount" },
               paid: { $sum: "$paidAmount" },
               due: { $sum: "$dueAmount" }
            }
         },
         { $sort: { "_id": 1 } }
      ]);
      res.status(200).json({ data: result });
   } catch (error) {
      console.log("Yearly Analytics Error:", error.message);
      res.status(500).json({ message: "Internal Server Error" });
   }
}

module.exports = {
   getSummary,
   getWeeklyAnalytics,
   getMonthlyAnalytics,
   getYearlyAnalytics
}