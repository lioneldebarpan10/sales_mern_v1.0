const paymentModel = require("../models/payment.model")
const substockistModel = require("../models/substockist.model")

async function createPayment(req, res) {

   try {

      const { substockistId, stockistName, fromDate, toDate, totalAmount, paidAmount } = req.body

      // step -1 validate payment
      if (!substockistId || !stockistName || !fromDate || !toDate || !totalAmount || paidAmount == null) {
         return res.status(400).json({
            message: "All fields are required"
         })
      }

      const fromDateObj = new Date(fromDate)
      const toDateObj = new Date(toDate)
      if (isNaN(fromDateObj.getTime()) || isNaN(toDateObj.getTime())) {
         return res.status(400).json({ message: "Invalid from/to date" })
      }

      if (fromDateObj > toDateObj) {
         return res.status(400).json({ message: "From Date cannot be after To Date" })
      }

      const normalizedId = String(substockistId).toUpperCase().trim()
      const substockist = await substockistModel.findOne({ substockistId: normalizedId })
      if (!substockist) {
         return res.status(400).json({
            message: "Substockist not found"
         })
      }

      const fullName = `${substockist.firstName} ${substockist.middleName ? substockist.middleName + ' ' : ''}${substockist.lastName}`.trim()
      if (fullName.toLowerCase() !== String(stockistName).trim().toLowerCase()) {
         return res.status(400).json({
            message: "Substockist name does not match the selected ID"
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
         fromDate: fromDateObj,
         toDate: toDateObj,
         totalAmount,
         paidAmount,
         dueAmount,
         paymentDate: toDateObj
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