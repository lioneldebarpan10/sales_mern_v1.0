const mongoose = require("mongoose")

const adminSchema = new mongoose.Schema({
   name:{
      type: String,
      required: [true , "Name is Required for Admin Registration"],
      trim: true
   },
   email:{
      type: String,
      required: [true , "Email is required for Admin Registration"],
      unique: true,
      lowercase: true,
      trim: true
   },
   password:{
      type: String,
      required: [true , "Password is required for Admin Registration"],
      minlength: 6
   }
},{
   timestamps: true
})

const adminModel = mongoose.model("Admin", adminSchema)

module.exports = adminModel