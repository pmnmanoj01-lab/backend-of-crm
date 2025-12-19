import express from "express"
import { authMiddleware } from "../middlewares/authMidleware.js";
import { checkAccess } from "../middlewares/authRole.js";
import { feature } from "../utils/feature.js";

import { createFiling, getFilingData, updateFiling } from "../controllers/product/filingController.js";
import { createPrePolish, getPrePolishData, updatePrePolish } from "../controllers/product/prepolishingController.js";
import { createSetting, getSettingData, updateSetting } from "../controllers/product/settingController.js";
import { createPolish, getPolishData, updatePolish } from "../controllers/product/polishingController.js";
import { createRepair, getRepairData, updateRepair } from "../controllers/product/repairController.js";
import { createProduct, deleteProduct, editProduct, getAllProducts, getProductById } from "../controllers/productController.js";
const productRoute = express.Router();
productRoute.post('/create-product', authMiddleware,checkAccess([feature.product]),createProduct);
productRoute.put('/update-product/:productId', authMiddleware,checkAccess([feature.product]),editProduct);
productRoute.delete('/delete-product/:productId', authMiddleware,checkAccess([feature.product]),deleteProduct);
productRoute.get('/get-all-products', authMiddleware,checkAccess([feature.product]),getAllProducts);
productRoute.get('/get-product-by-id/:id', authMiddleware,checkAccess([feature.product]),getProductById);

//filing routing

productRoute.post("/filing/create",authMiddleware,checkAccess([feature.product]),createFiling)
productRoute.put("/filing/update/:productId",authMiddleware,checkAccess([feature.product]),updateFiling)
productRoute.get("/filing/get/:productId",authMiddleware,checkAccess([feature.product]),getFilingData)

//Pre Polish routing

productRoute.post("/prepolish/create",authMiddleware,checkAccess([feature.product]),createPrePolish )
productRoute.put("/prepolish/update/:productId",authMiddleware,checkAccess([feature.product]),updatePrePolish )
productRoute.get("/prepolish/get/:productId",authMiddleware,checkAccess([feature.product]),getPrePolishData)

// Setting routing

productRoute.post("/setting/create",authMiddleware,checkAccess([feature.product]),createSetting )
productRoute.put("/setting/update/:productId",authMiddleware,checkAccess([feature.product]),updateSetting )
productRoute.get("/setting/get/:productId",authMiddleware,checkAccess([feature.product]),getSettingData)

// Polish routing

productRoute.post("/polish/create",authMiddleware,checkAccess([feature.product]),createPolish )
productRoute.put("/polish/update/:productId",authMiddleware,checkAccess([feature.product]),updatePolish)
productRoute.get("/polish/get/:productId",authMiddleware,checkAccess([feature.product]),getPolishData)

// Repair routing

productRoute.post("/repair/create",authMiddleware,checkAccess([feature.product]),createRepair )
productRoute.put("/repair/update/:productId",authMiddleware,checkAccess([feature.product]),updateRepair)
productRoute.get("/repair/get/:productId",authMiddleware,checkAccess([feature.product]),getRepairData)

export default productRoute