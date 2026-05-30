const jwt = require("jsonwebtoken")

function authMiddleware(req, res, next) {
   try {
      // First try cookie token
      let token = req.cookies?.token;

      // If no cookie, try Authorization header Bearer token
      if (!token && req.headers.authorization) {
         const parts = req.headers.authorization.split(' ');
         if (parts.length === 2 && parts[0] === 'Bearer') {
            token = parts[1];
         }
      }

      // step-1 check token
      if (!token) {
         return res.status(401).json({
            message: "Unauthorized access, token is missing"
         });
      }

      // step-2 verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.admin = decoded;
      next();
   } catch (error) {
      return res.status(401).json({
         message: "Unauthorized access, token is invalid"
      });
   }
}

module.exports = authMiddleware