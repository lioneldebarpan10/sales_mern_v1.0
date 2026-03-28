const paymentModel = require("../models/payment.model")
const substockistModel = require("../models/substockist.model")

async function createPayment(req, res) {

   try {

      const { substockistId, fromDate, toDate, totalAmount, paidAmount } = req.body

      // step -1 validate payment
      if (!substockistId || !fromDate || !toDate || !totalAmount || paidAmount == null) {
         return res.status(400).json({
            message: "All Fields are required"
         })
      }

      // step - 2 check if substocist exists or not
      const substockist = await substockistModel.findOne({ substockistId })
      if (!substockist) {
         return res.status(400).json({
            message: "Substockist not found"
         })
      }

      // step -3 calculate amount
      const dueAmount = totalAmount - paidAmount
      if (dueAmount < 0) {
         return res.status(400).json({
            message: "Paid amount cannot be greater than total amount"
         })
      }

      // step -4 create payment
      const payment = await paymentModel.create({
         substockist: substockist._id,
         fromDate,
         toDate,
         totalAmount,
         paidAmount,
         dueAmount
      })

      res.status(201).json({
         message: "Payment generated sucessfully",
         data: payment
      })

   }
   catch (error) {
      console.log("Create Payment Error:", error.message);
      res.status(500).json({
         message: "Internal Server Error"
      });
   }
}

module.exports = { createPayment }