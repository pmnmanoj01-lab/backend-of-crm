import express from "express"
import { checkAccess } from "../middlewares/authRole.js";
import { authMiddleware } from "../middlewares/authMidleware.js";
import { createCadProduct, deleteCadProduct, getAllCadProduct, updateCadProduct } from "../controllers/cadProductController.js";
import { feature } from "../utils/feature.js";
import { upload } from "../utils/upload.js";
const cadProductRoute = express.Router();
cadProductRoute.post('/upload-product', authMiddleware,checkAccess([feature.designer]),upload([
    { name: "images", maxCount: 3 },
    { name: "cadImage", maxCount: 1 },
  ]),createCadProduct);
cadProductRoute.put('/edit-product/:productId', authMiddleware,checkAccess([feature.designer]),updateCadProduct);
cadProductRoute.delete('/delete-product/:productId', authMiddleware,checkAccess([feature.designer]),deleteCadProduct);
cadProductRoute.get('/get-products', authMiddleware,checkAccess([feature.designer]),getAllCadProduct);
export default cadProductRoute