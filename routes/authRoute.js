import express from "express"
import { DecodeToken, login, Logout } from "../controllers/authController.js";
import { authMiddleware } from "../middlewares/authMidleware.js";

const authRoute = express.Router();


authRoute.post('/login', login);
authRoute.get('/me', authMiddleware,DecodeToken);
authRoute.post('/logout', authMiddleware,Logout);


export default authRoute