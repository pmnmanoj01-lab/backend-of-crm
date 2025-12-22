import express from "express"
import { DecodeToken, exitImpersonateAdmin, impersonateAdmin, login, Logout } from "../controllers/authController.js";
import { authMiddleware } from "../middlewares/authMidleware.js";
const authRoute = express.Router();
authRoute.post('/login', login);
authRoute.get('/verify-token', authMiddleware,DecodeToken);
authRoute.post('/logout', authMiddleware,Logout);
authRoute.post('/impersonate/:userId', authMiddleware,impersonateAdmin);
authRoute.post('/exitimpersonate', authMiddleware,exitImpersonateAdmin);

export default authRoute