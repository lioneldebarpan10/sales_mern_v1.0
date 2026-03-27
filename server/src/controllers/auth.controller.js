const adminModel = require("../models/admin.model");
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")


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

      // step-5 generate token
      const token = jwt.sign(
         { id: admin._id },
         process.env.JWT_SECRET,
         { expiresIn: "1d" }
      )

      // step - 6 cookie set
      res.cookie("token", token);

      // step -7 response
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

async function loginAdmin(req, res) {

   try {
      const { email, password } = req.body

      // step -1  validate request
      if (!email || !password) {
         return res.status(400).json({
            message: "Email and Password both are required"
         })
      }

      // step - 2 check if admin exists or not

      const admin = await adminModel.findOne({ email })
      if (!admin) {
         return res.status(400).json({
            message: "Invalid email or passowrd"
         })
      }

      // Step -3 compare password
      const isMatch = await bcrypt.compare(password, admin.password)

      if (!isMatch) {
         return res.status(400).json({
            message: "Invalid email or Password"
         })
      }

      // step-4 generate token
      const token = jwt.sign(
         { id: admin._id },
         process.env.JWT_SECRET,
         { expiresIn: "1d" }
      )

      // step - 5 cookie set
      res.cookie("token", token);

      // step -6 generate response

      res.status(200).json({
         message: "Login Successfully",
         admin: {
            id: admin._id,
            name: admin.name,
            email: admin.email
         }
      });
   }
   catch (error) {
      console.log("Login Error", error.message)
      res.status(500).json({
         message: "Internal Server Error"
      })
   }

}

module.exports = {
   registerAdmin,
   loginAdmin
}