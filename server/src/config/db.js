const mongoose = require("mongoose")

async function connectToDB(){
   try{
      await mongoose.connect(process.env.MONGO_URI)
      console.log("Database connected Successfully")
   }
   catch(error){
      console.log("Error Connecting Database" , error.message)
      process.exit(1)
   }
}

module.exports = connectToDB