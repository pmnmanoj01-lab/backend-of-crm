import express from "express"
import { authMiddleware } from "../middlewares/authMidleware.js";
import { getProductionAllUsersAtoRole } from "../controllers/managerController.js";
const managerRoute = express.Router();
managerRoute.get('/get-users', authMiddleware,getProductionAllUsersAtoRole);
export default managerRoute