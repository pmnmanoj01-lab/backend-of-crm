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
      wireWeight,
      scrab,
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
      wireWeight,
      scrab,
      extraMaterialWeight
    });

    if (filing) {
      productExists.filing = filing._id
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
      wireWeight,
      scrab,
      userId
    } = req.body;

    console.log("req body data is as------------> ",req.body)

    /* ✅ PREVENT NaN (NO LOGIC CHANGE) */
    weightProvided = Number(weightProvided) || 0;
    returnedWeight = Number(returnedWeight) || 0;
    extraMaterialWeight = Number(extraMaterialWeight) || 0;
    wireWeight = Number(wireWeight) || 0;
    scrab = Number(scrab) || 0;

    const productExists = await Product.findById(productId);
    if (!productExists) {
      return res.status(404).json({ success: false, message: "Product not found." });
    }

    const filing = await Filing.findOne({ product: productId });
    if (!filing) {
      return res.status(404).json({ success: false, message: "Filing data not found." });
    }

    const fields = {
      weightProvided,
      returnedWeight,
      material,
      subCategory,
      childCategory,
      extraMaterialWeight,
      userId,
      wireWeight,
      scrab,
      needExtraMaterial,
    };

    Object.keys(fields).forEach((key) => {
      if (fields[key] !== undefined && fields[key] !== "") {
        filing[key] = fields[key];
      }
    });

    if (weightProvided !== 0 && returnedWeight !== 0) {
      if (extraMaterialWeight !== 0) {
        const totalWeight = weightProvided + extraMaterialWeight;

        if (scrab !== 0) {
          filing.weightLoss = totalWeight - (returnedWeight + scrab);
        } else {
          filing.weightLoss = totalWeight - returnedWeight;
        }
      } else {
        if (scrab !== 0) {
          filing.weightLoss = weightProvided - (returnedWeight + scrab);
        } else {
          filing.weightLoss = weightProvided - returnedWeight;
        }
      }

      if (filing.weightLoss <= 0) filing.weightLoss = 0;
    }

    /* ✅ FINAL SAFETY */
    if (Number.isNaN(filing.weightLoss)) {
      filing.weightLoss = 0;
    }

    await filing.save();

    if (returnedWeight !== 0) {
      await Product.findByIdAndUpdate(productId, {
        $addToSet: { completedProcesses: "Filing" },
        filing: filing._id
      });

      if (wireWeight !== 0) {
        returnedWeight += wireWeight;
      }

      await PrePolish.findOneAndUpdate(
        { product: productId },
        { weightProvided: returnedWeight, product: productId },
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

