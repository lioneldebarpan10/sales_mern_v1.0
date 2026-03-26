const jwt = require("jsonwebtoken")

function authMiddleware(req , res , next){

   try{
      const token = req.cookies.token

      // step-1 check token
      if(!token){
         return res.status(400).json({
            message: "Unauthorized access, token is missing"
         })
      }

      // step-2 verify token
      const decoded = jwt.verify(token , process.env.JWT_SECRET)

      req.admin = decoded
      next();
   }
   catch(error){
      return res.status().json({
         message: "Unauthorized access, token in invalid"
      })
   }

}

module.exports = {
   authMiddleware
}