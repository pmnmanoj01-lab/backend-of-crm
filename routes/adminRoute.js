import express from "express"
import { deleteUser, getAllUsers, getUserById, getUserPermissions, registerUser, updatePermissions, updateUser } from "../controllers/adminController.js";
import { authMiddleware } from "../middlewares/authMidleware.js";
import { checkAccess } from "../middlewares/authRole.js";
import { feature } from "../utils/feature.js";
const adminRoute = express.Router();
adminRoute.post('/register',authMiddleware,checkAccess(), registerUser);
adminRoute.get('/get-all-user',authMiddleware,checkAccess([feature.team]), getAllUsers);
adminRoute.delete("/delete-user/:id", authMiddleware,checkAccess([feature.team]), deleteUser);
adminRoute.patch("/update-user/:id", authMiddleware,checkAccess([feature.team,feature.profile]), updateUser);
adminRoute.get("/get-single-user/:id", authMiddleware,checkAccess([feature.team,feature.profile]), getUserById);
adminRoute.put("/save-permissions", authMiddleware,checkAccess([feature.permissions]), updatePermissions);
adminRoute.get("/get-permissions/:id", authMiddleware,checkAccess([feature.permissions]), getUserPermissions);
export default adminRoute