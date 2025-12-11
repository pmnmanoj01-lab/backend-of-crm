import Product from "../../models/Product.js";
import Polish from "../../models/ProductProcess/Polish.js";
import Setting from "../../models/ProductProcess/Setting.js";

export const createSetting = async (req, res) => {
    try {
        const {
            weightProvided,
            returnedWeight = 0,
            userId,
            diamondCategory,
            diamondSubCategory,
            diamondChildCategory,
            diamondWeight = 0,
            product
        } = req.body;

        // ---------------------------
        // Basic Validations
        // ---------------------------
        if (!product) {
            return res.status(400).json({
                success: false,
                message: "Product ID is required.",
            });
        }
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "User ID is required.",
            });
        }

        // ---------------------------
        // Check Product Exists
        // ---------------------------
        const productExists = await Product.findById(product);

        if (!productExists) {
            return res.status(404).json({
                success: false,
                message: "Product not found.",
            });
        }

        // ---------------------------
        // Prevent Duplicate Filing Entry
        // ---------------------------
        const existingSetting = await Setting.findOne({ product }).lean();

        if (existingSetting) {
            return res.status(409).json({
                success: false,
                message: "Filing process for this product already exists.",
            });
        }

        // ---------------------------
        // Create Filing Record
        // ---------------------------
        const setting = await Setting.create({
            product,
            weightProvided,
            returnedWeight,
            userId,
            diamondCategory,
            diamondSubCategory,
            diamondChildCategory,
            diamondWeight
        });

        if (setting) {
            productExists.setting = setting._id
            await productExists.save()
        }
        // ---------------------------
        // Response
        // ---------------------------
        return res.status(201).json({
            success: true,
            message: "Filing process created successfully.",
            data: setting,
        });

    } catch (error) {
        console.error("Create Filing Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error while creating filing process.",
        });
    }
};




export const updateSetting = async (req, res) => {
    try {
        const { productId } = req.params;

        let {
            weightProvided,
            returnedWeight,
            diamondCategory,
            diamondSubCategory,
            diamondChildCategory,
            diamondWeight,
            userId
        } = req.body;

        // ---------------------------------------------
        // Validate Product ID
        // ---------------------------------------------
        const productExists = await Product.findById(productId).lean();
        if (!productExists) {
            return res.status(404).json({
                success: false,
                message: "Product not found.",
            });
        }

        // ---------------------------------------------
        // Find Filing Entry
        // ---------------------------------------------
        const setting = await Setting.findOne({ product: productId });
        if (!setting) {
            return res.status(404).json({
                success: false,
                message: "Filing data not found.",
            });
        }

        // ---------------------------------------------
        // Update Only Provided Fields
        // ---------------------------------------------
        const fields = {
            weightProvided,
            returnedWeight,
            diamondCategory,
            diamondSubCategory,
            diamondChildCategory,
            diamondWeight,
            userId,
        };

        // Clean undefined / empty values
        Object.keys(fields).forEach((key) => {
            if (fields[key] !== undefined && fields[key] !== "") {
                setting[key] = fields[key];
            }
        });

        // ---------------------------------------------
        // RECALCULATE WEIGHT LOSS
        // Always calculate using updated or old values
        // ---------------------------------------------
        const updatedWeightProvided =
            weightProvided !== undefined ? weightProvided : setting.weightProvided;

        const updatedReturnedWeight =
            returnedWeight !== undefined ? returnedWeight : setting.returnedWeight;

        if (
            updatedWeightProvided !== undefined &&
            updatedReturnedWeight !== undefined &&
            updatedWeightProvided !== null &&
            updatedReturnedWeight !== null
        ) {
            setting.weightLoss = Number(updatedWeightProvided) - Number(updatedReturnedWeight);
            if (setting.weightLoss < 0) setting.weightLoss = 0;
        }

        await setting.save();

        // ---------------------------------------------
        // UPDATE PROCESS STATUS ON PRODUCT
        // (marks Filing as completed)
        // ---------------------------------------------
        await Product.findByIdAndUpdate(productId, {
            $addToSet: { completedProcesses: "Setting" },
        });

        // ---------------------------------------------
        // UPDATE PRE-POLISH (next process)
        // Only if returnedWeight came in request
        // ---------------------------------------------
        if (returnedWeight !== undefined) {
            if (diamondWeight !== undefined) {
                returnedWeight += Number(diamondWeight)
            }
            await Polish.findOneAndUpdate(
                { product: productId },
                { weightProvided: returnedWeight },
                { upsert: true, new: true }
            );
        }

        return res.status(200).json({
            success: true,
            message: "Filing updated successfully.",
            data: setting,
        });

    } catch (error) {
        console.error("Update Filing Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error while updating filing process",
        });
    }
};
export const getSettingData = async (req, res) => {
    try {
        const { productId } = req.params;

        if (!productId) {
            return res.status(400).json({
                success: false,
                message: "Product ID is required.",
            });
        }

        const filingData = await Setting.findOne({ product: productId })
            .populate({
                path: "userId",
                select: "-password -__v"  // exclude password (and other fields if needed)
            })
            .lean();

        if (!filingData) {
            return res.status(404).json({
                success: false,
                message: "Filing data not found.",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Filing data retrieved successfully.",
            data: filingData,
        });

    } catch (error) {
        console.error("Error fetching Filing data:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error.",
        });
    }
};

