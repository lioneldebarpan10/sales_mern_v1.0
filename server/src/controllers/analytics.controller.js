const paymentModel = require("../models/payment.model");

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

      res.status(200).json({
         data: result[0] || { total: 0, paid: 0, due: 0 }
      });

   }
   catch (error) {
      console.log("Summary Error:", error.message);
      res.status(500).json({ message: "Internal Server error" });

   }
}

async function getWeeklyAnalytics(req, res) {
   try {
      const result = await paymentModel.aggregate([
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
   }
   catch (error) {
      console.log("Weekly Analytics Error:", error.message);
      res.status(500).json({ message: "Internal Server error" });
   }
}

async function getMonthlyAnalytics(req, res) {
   try {
      const result = await paymentModel.aggregate([

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
   }
   catch (error) {
      console.log("Monthly Analytics Error:", error.message);
      res.status(500).json({ message: "Internal Server error" });
   }
}

async function getYearlyAnalytics(req, res) {
   try {
      const result = await paymentModel.aggregate([
         {
            $group: {
               _id: { $year: "paymentDate" },
               total: { $sum: "totalAmount" },
               paid: { $sum: "paidAmount" },
               due: { $sum: "$dueAmount" }
            }
         },
         { $sort: { "_id": 1 } }
      ]);
      res.status(200).json({ data: result });
   }
   catch (error) {
      console.log("Yearly Analytics Error:", error.message);
      res.status(500).json({message: "Internal Server Error"});s
   }
}


module.exports = {
   getSummary,
   getWeeklyAnalytics,
   getMonthlyAnalytics,
   getYearlyAnalytics
}