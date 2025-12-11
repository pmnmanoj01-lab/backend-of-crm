import Product from "../../models/Product.js";
import PrePolish from "../../models/ProductProcess/PrePolish.js";
import Setting from "../../models/ProductProcess/Setting.js";

export const createPrePolish = async (req, res) => {
  try {
    const {
      weightProvided,
      returnedWeight = 0,
      userId,
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
    const existingPrePolish = await PrePolish.findOne({ product }).lean();

    if (existingPrePolish) {
      return res.status(409).json({
        success: false,
        message: "Filing process for this product already exists.",
      });
    }

    // ---------------------------
    // Create Filing Record
    // ---------------------------
    const prepolish = await PrePolish.create({
      product,
      weightProvided,
      returnedWeight,
      userId,
    });

    if(prepolish){
        productExists.prepolish=prepolish._id
        await productExists.save()
    }
    // ---------------------------
    // Response
    // ---------------------------
    return res.status(201).json({
      success: true,
      message: "Filing process created successfully.",
      data: prepolish,
    });

  } catch (error) {
    console.error("Create Filing Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error while creating filing process.",
    });
  }
};




export const updatePrePolish = async (req, res) => {
  try {
    const { productId } = req.params;

    const {
      weightProvided,
      returnedWeight,
      userId,
      product
    } = req.body;

    // ---------------------------------------------
    // Validate Product ID (optional but good)
    // ---------------------------------------------
    
      const productExists = await Product.findById(product).lean();
      if (!productExists) {
        return res.status(404).json({
          success: false,
          message: "Product not found.",
        });
      }
    

    const prepolish=await PrePolish.findOne({product:productId}).exec()
    
    if (userId !== undefined) prepolish.userId = userId;

    if (weightProvided !== undefined) prepolish.weightProvided = weightProvided;
    if (returnedWeight !== undefined) prepolish.returnedWeight = returnedWeight;
    

    // Recalculate weight loss only if both fields exist in request
    if (weightProvided !== undefined && returnedWeight !== undefined) {
      prepolish.weightLoss = weightProvided - returnedWeight;
    }

    await prepolish.save();

    // Update Product process progress

    

    // Update next process only if returnedWeight came from input
    if (returnedWeight !== undefined && productExists.prepolish !== null) {
      await Product.findByIdAndUpdate(prepolish.product, {
        $addToSet: { completedProcesses: "Pre Polish" },
      });
      await Setting.findOneAndUpdate(
        { product: prepolish.product },
        { weightProvided: returnedWeight }
      );
    }    return res.status(200).json({
      success: true,
      message: "Filing updated successfully.",
      data: prepolish,
    });

  } catch (error) {
    console.error("Update Filing Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while updating filing process",
    });
  }
};

export const getPrePolishData = async (req, res) => {
    try {
        const { productId } = req.params;

        if (!productId) {
            return res.status(400).json({
                success: false,
                message: "Product ID is required.",
            });
        }

       const prepolish = await PrePolish.findOne({ product: productId })
    .populate({
        path: "userId",
        select: "-password -__v"  // exclude password (and other fields if needed)
    })
    .lean();

        if (!prepolish) {
            return res.status(404).json({
                success: false,
                message: "Filing data not found.",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Filing data retrieved successfully.",
            data: prepolish,
        });

    } catch (error) {
        console.error("Error fetching Filing data:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error.",
        });
    }
};

