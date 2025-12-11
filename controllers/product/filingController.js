import Filing from "../../models/ProductProcess/Filing.js";
import Product from "../../models/Product.js";
import PrePolish from "../../models/ProductProcess/PrePolish.js";

export const createFiling = async (req, res) => {
  try {
    const {
      weightProvided,
      returnedWeight = 0,
      userId,
      material,
      needExtraMaterial,
      subCategory,
      childCategory,
      extraMaterialWeight = 0,
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
    const existingFiling = await Filing.findOne({ product }).lean();

    if (existingFiling) {
      return res.status(409).json({
        success: false,
        message: "Filing process for this product already exists.",
      });
    }

    // ---------------------------
    // Create Filing Record
    // ---------------------------
    const filing = await Filing.create({
      product,
      weightProvided,
      returnedWeight,
      userId,
      material,
      needExtraMaterial,
      subCategory,
      childCategory,
      extraMaterialWeight
    });

    if(filing){
        productExists.filing=filing._id
        await productExists.save()
    }
    // ---------------------------
    // Response
    // ---------------------------
    return res.status(201).json({
      success: true,
      message: "Filing process created successfully.",
      data: filing,
    });

  } catch (error) {
    console.error("Create Filing Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error while creating filing process.",
    });
  }
};




export const updateFiling = async (req, res) => {
  try {
    const { productId } = req.params;

    let {
      weightProvided,
      returnedWeight,
      material,
      subCategory,
      needExtraMaterial,
      childCategory,
      extraMaterialWeight,
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
    const filing = await Filing.findOne({ product: productId });
    if (!filing) {
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
      material,
      subCategory,
      childCategory,
      extraMaterialWeight,
      userId,
      needExtraMaterial,
    };

    // Clean undefined / empty values
    Object.keys(fields).forEach((key) => {
      if (fields[key] !== undefined && fields[key] !== "") {
        filing[key] = fields[key];
      }
    });

    // ---------------------------------------------
    // RECALCULATE WEIGHT LOSS
    // Always calculate using updated or old values
    // ---------------------------------------------
    const updatedWeightProvided =
      weightProvided !== undefined ? weightProvided : filing.weightProvided;

    const updatedReturnedWeight =
      returnedWeight !== undefined ? returnedWeight : filing.returnedWeight;

    if (
      updatedWeightProvided !== undefined &&
      updatedReturnedWeight !== undefined &&
      updatedWeightProvided !== null &&
      updatedReturnedWeight !== null
    ) {
      filing.weightLoss = Number(updatedWeightProvided) - Number(updatedReturnedWeight);
      if (filing.weightLoss < 0) filing.weightLoss = 0;
    }

    await filing.save();

    // ---------------------------------------------
    // UPDATE PROCESS STATUS ON PRODUCT
    // (marks Filing as completed)
    // ---------------------------------------------
    await Product.findByIdAndUpdate(productId, {
      $addToSet: { completedProcesses: "Filing" },
    });

    // ---------------------------------------------
    // UPDATE PRE-POLISH (next process)
    // Only if returnedWeight came in request
    // ---------------------------------------------
    if (returnedWeight !== undefined) {
        if(extraMaterialWeight!==undefined){
            returnedWeight+=extraMaterialWeight
        }
        console.log("here is some logic ---------> ",needExtraMaterial,extraMaterialWeight)
      await PrePolish.findOneAndUpdate(
        { product: productId },
        { weightProvided: returnedWeight },
        { upsert: true, new: true }
      );
    }

    return res.status(200).json({
      success: true,
      message: "Filing updated successfully.",
      data: filing,
    });

  } catch (error) {
    console.error("Update Filing Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while updating filing process",
    });
  }
};


export const getFilingData = async (req, res) => {
    try {
        const { productId } = req.params;

        if (!productId) {
            return res.status(400).json({
                success: false,
                message: "Product ID is required.",
            });
        }

       const filingData = await Filing.findOne({ product: productId })
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

