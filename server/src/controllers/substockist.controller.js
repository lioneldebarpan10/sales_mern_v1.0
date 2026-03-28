const substockistModel = require("../models/substockist.model")

async function createSubstockist(req, res) {
   try {
      const { substockistId, firstName, middleName, lastName, phone, email, address } = req.body

      // step -1 validate request
      if (!substockistId || !firstName || !lastName || !phone) {
         return res.status(400).json({
            message: "Fields are required"
         })
      }

      // step - 2 check for duplicate substockist
      const normalizedId = substockistId.toUpperCase();

      const isExists = await substockistModel.findOne({
         substockistId: normalizedId
      });

      if (isExists) {
         return res.status(400).json({
            message: "Substockist ID already exists"
         })
      }

      // step - 3 create a substockist
      const newSubStockist = await substockistModel.create({
         substockistId: normalizedId,
         firstName,
         middleName,
         lastName,
         phone,
         email,
         address
      })

      res.status(201).json({
         message: "Substockist Created successfully",
         data: newSubStockist
      })

   }
   catch (error) {
      console.log("Create Substockist Error:", error.message);
      res.status(500).json({ message: "Internal Server Error" });
   }
}

async function getAllSubstockists(req, res) {

   try {
      const { search } = req.query
      let query = {};

      if (search) {
         query = {
            $or: [
               { substockistId: { $regex: search, $options: "i" } },
               { firstName: { $regex: search, $options: "i" } },
               { lastName: { $regex: search, $options: "i" } }
            ]
         };
      }

      const substockists = await substockistModel.find(query).sort({ createdAt: -1 });

      res.status(200).json({
         count: substockists.length,
         data: substockists
      });

   }
   catch (error) {
      console.log("Fetch Substockist error: ", error.message)
      res.status(500).json({ message: "Internal Server error" })
   }

}


module.exports = {
   createSubstockist,
   getAllSubstockists
}