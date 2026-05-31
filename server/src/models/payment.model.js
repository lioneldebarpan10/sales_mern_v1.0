const mongoose = require("mongoose")

const paymentSchema = new mongoose.Schema({
   substockist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Substockist",
      required: true
   },
   fromDate: {
      type: Date,
      required: true
   },
   toDate: {
      type: Date,
      required: true
   },
   totalAmount: {
      type: Number,
      required: true
   },
   paidAmount: {
      type: Number,
      required: true
   },
   dueAmount: {
      type: Number,
      required: true
   },
   paymentRecovery: [{
      amount: {
         type: Number,
         required: true
      },
      recoveryDate: {
         type: Date,
         default: Date.now
      },
      notes: {
         type: String
      }
   }],
   paymentDate: {
      type: Date,
      default: Date.now
   }
},{
   timestamps: true
})

const paymentModel = mongoose.model("payment" , paymentSchema)

module.exports = paymentModel