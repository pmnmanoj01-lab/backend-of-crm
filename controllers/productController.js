import Product from "../models/Product.js";
import Filing from "../models/ProductProcess/Filing.js";
export const createProduct = async (req, res) => {
  try {
    const {
      material,
      subCategory,
      childCategory,
      weightProvided,
      returnedWeight = 0,
      userId,
    } = req.body;

    // Basic Validation
    if (!material || !weightProvided || !userId) {
      return res.status(400).json({
        success: false,
        message: "Material, Weight Provided and User ID are required",
      });
    }

    if (weightProvided < 0 || returnedWeight < 0) {
      return res.status(400).json({
        success: false,
        message: "Weights cannot be negative",
      });
    }

    // -----------------------------------
    // 💡 Calculate Weight Loss (if returnedWeight exists)
    // -----------------------------------
    let remainingWeight = 0;

    if (returnedWeight > 0) {
      if (returnedWeight > weightProvided) {
        return res.status(400).json({
          success: false,
          message: "Returned weight cannot be greater than weight provided",
        });
      }

      remainingWeight = weightProvided - returnedWeight; // weight loss
    }

    // -----------------------------------
    // Create Product
    // -----------------------------------
    const newProduct = await Product.create({
      material,
      subCategory,
      childCategory,
      weightProvided,
      returnedWeight,
      weightLoss: remainingWeight,
      userId,
    });

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: newProduct,
    });

  } catch (error) {
    console.error("Create Product Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
export const editProduct = async (req, res) => {
  try {
    const user = req.user;
    const { productId } = req.params;



    const casting = await Product.findById(productId);
    if (!casting) {
      return res.status(404).json({
        success: false,
        message: "Product process not found.",
      });
    }

    const {
      material,
      subCategory,
      childCategory,
      weightProvided,
      returnedWeight,
      userId,
    } = req.body;
  
    // Update only if exists in req.body
    if (material !== undefined) casting.material = material;
    if (subCategory !== undefined) casting.subCategory = subCategory;
    if (childCategory !== undefined) casting.childCategory = childCategory;
    if (userId !== undefined) casting.userId = userId;

    if (weightProvided !== undefined) casting.weightProvided = weightProvided;
    if (returnedWeight !== undefined) casting.returnedWeight = returnedWeight;

    // Recalculate weight loss only if both fields exist in request
    if (weightProvided !== undefined && returnedWeight !== undefined) {
      casting.weightLoss = weightProvided - returnedWeight;
    }

    await casting.save();

    // Update Product process progress


    // Update next process only if returnedWeight came from input
    if (returnedWeight !== undefined && casting.filing !== null) {
      await Product.findByIdAndUpdate(casting._id, {
        $addToSet: { completedProcesses: "Casting" },
      });
      await Filing.findOneAndUpdate(
        { product: casting._id },
        { weightProvided: returnedWeight }
      );
    }

    return res.json({
      success: true,
      message: "Product process updated successfully.",
      casting,
    });

  } catch (error) {
    console.error("Update Product Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating Product process",
    });
  }
}

export const getAllProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      material,
      subCategory,
      childCategory,
      userId,
    } = req.query;

    const skip = (page - 1) * limit;

    let query = {};

    // If user is NOT admin/manager/Product Manager → filter by userId
    if (userId) {
      query.userId = userId;
    }

    // Searching
    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    // Material filters
    if (material) query.material = material;
    if (subCategory) query.subCategory = subCategory;
    if (childCategory) query.childCategory = childCategory;

    const products = await Product.find(query)
      .skip(skip)
      .limit(Number(limit));

    const total = await Product.countDocuments(query);

    res.json({
      products,
      pagination: {
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
};
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }

    // Fetch product (populate only if needed)
    const product = await Product.findById(id).populate("userId");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product fetched successfully",
      data: product,
    });
  } catch (error) {
    console.error("Get Product By ID Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

