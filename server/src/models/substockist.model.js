const mongoose = require("mongoose");

const substockistSchema = new mongoose.Schema({
   substockistId: {
      type: String,
      required: true,
      unique: true,
      trim: true
   },
   firstName: {
      type: String,
      required: true,
      trim: true
   },
   middleName: {
      type: String,
      trim: true
   },
   lastName: {
      type: String,
      required: true,
      trim: true
   },
   phone: {
      type: String,
      required: true
   },
   email: {
      type: String,
      trim: true,
      lowercase: true
   },
   address: {
      type: String
   }
}, {
   timestamps: true
});

const substockistModel = mongoose.model("Substockist", substockistSchema);

module.exports = substockistModel;