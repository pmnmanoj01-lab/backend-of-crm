import express from "express"
import { checkAccess } from "../middlewares/authRole.js";
import { authMiddleware } from "../middlewares/authMidleware.js";
import { feature } from "../utils/feature.js";
import { addCategory, deleteCategory, editCategory, getAllCategories } from "../controllers/master/categoryController.js";
import { addSubCategory, deleteSubCategory, editSubCategory, getAllSubCategories } from "../controllers/master/subCategoryController.js";
import { addSubChildCategory, deleteSubChildCategory, editSubChildCategory, getAllSubChildCategories } from "../controllers/master/subChildCategoryController.js";
const masterRoute = express.Router();

//---------------------------------------category-------------------------------------------->

masterRoute.post('/add-category', authMiddleware,checkAccess([feature.master]),addCategory);
masterRoute.put('/edit-category/:categoryId', authMiddleware,checkAccess([feature.master]),editCategory);
masterRoute.delete('/delete-category/:categoryId', authMiddleware,checkAccess([feature.master]),deleteCategory);
masterRoute.get('/get-categories', authMiddleware,checkAccess([feature.master]),getAllCategories);

//---------------------------------------sub category-------------------------------------------->

masterRoute.post('/add-sub-category', authMiddleware,checkAccess([feature.master]),addSubCategory);
masterRoute.put('/edit-sub-category/:subCategoryId', authMiddleware,checkAccess([feature.master]),editSubCategory);
masterRoute.delete('/delete-sub-category/:subCategoryId', authMiddleware,checkAccess([feature.master]),deleteSubCategory);
masterRoute.get('/get-sub-categories', authMiddleware,checkAccess([feature.master]),getAllSubCategories);

//---------------------------------------sub child category-------------------------------------------->

masterRoute.post('/add-sub-child-category', authMiddleware,checkAccess([feature.master]),addSubChildCategory);
masterRoute.put('/edit-sub-child-category/:subChildCategoryId', authMiddleware,checkAccess([feature.master]),editSubChildCategory);
masterRoute.delete('/delete-sub-child-category/:subChildCategoryId', authMiddleware,checkAccess([feature.master]),deleteSubChildCategory);
masterRoute.get('/get-sub-child-categories', authMiddleware,checkAccess([feature.master]),getAllSubChildCategories);

export default masterRoute