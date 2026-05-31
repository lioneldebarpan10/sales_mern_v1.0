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

async function getPaymentHistory(req, res) {
   try {
      const page = Math.max(parseInt(req.query.page, 10) || 1, 1)
      const limit = Math.max(Math.min(parseInt(req.query.limit, 10) || 10, 50), 1)
      const skip = (page - 1) * limit
      const status = String(req.query.status || 'all').trim().toLowerCase()
      const search = String(req.query.search || '').trim()

      const stages = [
         {
            $lookup: {
               from: 'substockists',
               localField: 'substockist',
               foreignField: '_id',
               as: 'substockist'
            }
         },
         {
            $unwind: {
               path: '$substockist',
               preserveNullAndEmptyArrays: true
            }
         },
         {
            $addFields: {
               paymentDateString: {
                  $dateToString: {
                     format: '%Y-%m-%d',
                     date: '$paymentDate'
                  }
               }
            }
         }
      ]

      const filters = []
      if (status === 'paid') {
         filters.push({ dueAmount: 0 })
      } else if (status === 'due') {
         filters.push({ dueAmount: { $gt: 0 } })
      }

      if (search) {
         const regex = new RegExp(search, 'i')
         filters.push({
            $or: [
               { 'substockist.substockistId': regex },
               { 'substockist.firstName': regex },
               { 'substockist.middleName': regex },
               { 'substockist.lastName': regex },
               { paymentDateString: regex }
            ]
         })
      }

      if (filters.length) {
         stages.push({ $match: filters.length === 1 ? filters[0] : { $and: filters } })
      }

      const pipeline = [
         ...stages,
         { $sort: { paymentDate: -1 } },
         {
            $facet: {
               metadata: [{ $count: 'totalCount' }],
               data: [{ $skip: skip }, { $limit: limit }]
            }
         }
      ]

      const [result] = await paymentModel.aggregate(pipeline)
      const totalCount = result?.metadata?.[0]?.totalCount || 0
      const totalPages = Math.max(Math.ceil(totalCount / limit), 1)

      res.status(200).json({
         data: result?.data || [],
         meta: {
            page,
            limit,
            totalCount,
            totalPages
         }
      })
   } catch (error) {
      console.log("Payment History Error:", error.message)
      res.status(500).json({ message: "Internal Server Error" })
   }
}

async function recordPaymentRecovery(req, res) {
   try {
      const { paymentId } = req.params
      const { amount, notes } = req.body

      if (!paymentId || !amount) {
         return res.status(400).json({
            message: "Payment ID and amount are required"
         })
      }

      const recoveryAmount = parseFloat(amount)
      if (recoveryAmount <= 0) {
         return res.status(400).json({
            message: "Recovery amount must be greater than 0"
         })
      }

      const payment = await paymentModel.findById(paymentId)
      if (!payment) {
         return res.status(404).json({
            message: "Payment not found"
         })
      }

      const canRecover = payment.dueAmount

      if (recoveryAmount > canRecover) {
         return res.status(400).json({
            message: `Cannot recover more than due amount. Remaining due: $${canRecover}`
         })
      }

      payment.paymentRecovery.push({
         amount: recoveryAmount,
         recoveryDate: new Date(),
         notes: notes || ''
      })

      const totalRecoveredNow = (payment.paymentRecovery || []).reduce((sum, r) => sum + r.amount, 0)
      payment.paidAmount = payment.paidAmount + recoveryAmount
      payment.dueAmount = payment.totalAmount - payment.paidAmount

      await payment.save()

      res.status(200).json({
         message: "Payment recovery recorded successfully",
         data: payment
      })
   } catch (error) {
      console.log("Record Payment Recovery Error:", error.message)
      res.status(500).json({ message: "Internal Server Error" })
   }
}

module.exports = { createPayment, getPaymentHistory, recordPaymentRecovery }