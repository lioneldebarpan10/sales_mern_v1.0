const adminModel = require("../models/admin.model");
const bcrypt = require("bcrypt")

async function registerAdmin(req, res) {

   try {
      const { name, email, password } = req.body

      // step - 1 Validate request
      if (!name || !email || !password) {
         return res.status(400).json({
            message: "Name ,Email & Password all are required"
         })
      }

      // step -2 check if admin already exists
      const isAdminAlreadyExists = await adminModel.findOne({ email })

      if (isAdminAlreadyExists) {
         return res.status(400).json({
            message: "Admin is already exist with these email"
         })
      }

      //step -3 hashing password using bcrypt
      const hashedPassword = await bcrypt.hash(password, 10)

      // step - 4 create admin in db
      const admin = await adminModel.create({
         name,
         email,
         password: hashedPassword
      });

      // step -5 response

      res.status(201).json({
         message: "Admin Created Successfully",
         admin: {
            id: admin._id,
            name: admin.name,
            email: admin.password
         }
      });
   }
   catch (error) {
      console.log("Register Error", error.message)
      res.status(500).json({
         message: "Internal Server error"
      })
   }
}



module.exports = {
   registerAdmin,
   loginAdmin,

}