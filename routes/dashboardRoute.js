import express from "express"
import { authMiddleware } from "../middlewares/authMidleware.js";
import { getDashboardStatData } from "../controllers/dashboardController.js";
const dashboardRoute = express.Router();
dashboardRoute.get('/get-dashboard-data-stats-card', authMiddleware,getDashboardStatData);
export default dashboardRoute