// middlewares/authMiddleware.js
import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
    try {
        const token = req.cookies?.token; // read token from cookies
// console.log("token ----> ",token)
        if (!token) {
            return res.status(401).json({success:false, message: "Not authenticated" });
        }

        // verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // store user data in request
        req.user = decoded;
        
        next(); // allow request to continue
    } catch (error) {
        return res.status(401).json({success:false, message: "Invalid or expired token" });
    }
};
