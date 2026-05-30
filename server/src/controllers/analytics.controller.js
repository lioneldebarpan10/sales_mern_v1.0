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
      // Use UTC-based week boundaries (Sun–Sat of current week)
      const now = new Date();
      const dayOfWeek = now.getUTCDay(); // 0=Sun, 6=Sat
      const startOfWeek = new Date(Date.UTC(
         now.getUTCFullYear(),
         now.getUTCMonth(),
         now.getUTCDate() - dayOfWeek,
         0, 0, 0, 0
      ));
      const endOfWeek = new Date(Date.UTC(
         now.getUTCFullYear(),
         now.getUTCMonth(),
         now.getUTCDate() - dayOfWeek + 6,
         23, 59, 59, 999
      ));

      const result = await paymentModel.aggregate([
         {
            $match: {
               createdAt: {
                  $gte: startOfWeek,
                  $lte: endOfWeek
               }
            }
         },
         {
            $group: {
               _id: { $dayOfWeek: "$createdAt" },
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
      const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
      const monthEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59, 999));

      const result = await paymentModel.aggregate([
         {
            $match: {
               createdAt: {
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
                     $divide: [{ $dayOfMonth: "$createdAt" }, 7]
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
      const yearStart = new Date(Date.UTC(now.getUTCFullYear(), 0, 1));
      const yearEnd = new Date(Date.UTC(now.getUTCFullYear(), 11, 31, 23, 59, 59, 999));

      const result = await paymentModel.aggregate([
         {
            $match: {
               createdAt: {
                  $gte: yearStart,
                  $lte: yearEnd
               }
            }
         },
         {
            $group: {
               _id: { $month: "$createdAt" },
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