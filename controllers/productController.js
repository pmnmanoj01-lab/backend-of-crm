import mongoose from "mongoose";
import Product from "../models/Product.js";
import Filing from "../models/ProductProcess/Filing.js";
import Setting from "../models/ProductProcess/Setting.js";
import PrePolish from "../models/ProductProcess/PrePolish.js";
import Polish from "../models/ProductProcess/Polish.js";
import Repair from "../models/ProductProcess/Repair.js";
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
    if (weightProvided !== 0 && returnedWeight !== 0) {
      casting.weightLoss = weightProvided - returnedWeight;
    }

    await casting.save();

    // Update Product process progress

    // Update next process only if returnedWeight came from input
    if (returnedWeight !== 0) {

      await Filing.findOneAndUpdate(
        { product: casting._id },
        { weightProvided: returnedWeight, product: casting._id },
        { upsert: true, new: true }
      );
      await Product.findByIdAndUpdate(casting._id, {
        $addToSet: { completedProcesses: "Casting" },
      }, { new: true });
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

    const matchStage = {};

    // Search
    if (search) {
      matchStage.name = { $regex: search, $options: "i" };
    }

    // Filters
    if (material) matchStage.material = material;
    if (subCategory) matchStage.subCategory = subCategory;
    if (childCategory) matchStage.childCategory = childCategory;

    const pipeline = [
      { $match: matchStage },

      /* ---------------- CASTING ---------------- */
      {
        $lookup: {
          from: "settings",
          let: { productId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$product", "$$productId"] }
              }
            },
            {
              $lookup: {
                from: "users",
                localField: "userId",
                foreignField: "_id",
                as: "user"
              }
            },
            {
              $unwind: {
                path: "$user",
                preserveNullAndEmptyArrays: true
              }
            },
            {
              $project: {
                "user.password": 0, // hide sensitive fields
                "user.__v": 0
              }
            }
          ],
          as: "setting",
        },
      },

      /* ---------------- FILING ---------------- */
      {
        $lookup: {
          from: "filings",
          let: { productId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$product", "$$productId"] }
              }
            },
            {
              $lookup: {
                from: "users",
                localField: "userId",
                foreignField: "_id",
                as: "user"
              }
            },
            {
              $unwind: {
                path: "$user",
                preserveNullAndEmptyArrays: true
              }
            },
            {
              $project: {
                "user.password": 0, // hide sensitive fields
                "user.__v": 0
              }
            }
          ],
          as: "filing"
        }
      }
      ,

      /* ---------------- PREPOLISH ---------------- */
      {
        $lookup: {
          from: "prepolishes",
          let: { productId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$product", "$$productId"] }
              }
            },
            {
              $lookup: {
                from: "users",
                localField: "userId",
                foreignField: "_id",
                as: "user"
              }
            },
            {
              $unwind: {
                path: "$user",
                preserveNullAndEmptyArrays: true
              }
            },
            {
              $project: {
                "user.password": 0, // hide sensitive fields
                "user.__v": 0
              }
            }
          ],
          as: "prepolish",
        },
      },
      {
        $lookup: {
          from: "polishes",
          let: { productId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$product", "$$productId"] }
              }
            },
            {
              $lookup: {
                from: "users",
                localField: "userId",
                foreignField: "_id",
                as: "user"
              }
            },
            {
              $unwind: {
                path: "$user",
                preserveNullAndEmptyArrays: true
              }
            },
            {
              $project: {
                "user.password": 0, // hide sensitive fields
                "user.__v": 0
              }
            }
          ],
          as: "polish",
        },
      },
      {
        $lookup: {
          from: "repairs",
          let: { productId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$product", "$$productId"] }
              }
            },
            {
              $lookup: {
                from: "users",
                localField: "userId",
                foreignField: "_id",
                as: "user"
              }
            },
            {
              $unwind: {
                path: "$user",
                preserveNullAndEmptyArrays: true
              }
            },
            {
              $project: {
                "user.password": 0, // hide sensitive fields
                "user.__v": 0
              }
            }
          ],
          as: "repair",
        },
      },
      {
              $lookup: {
                from: "users",
                localField: "userId",
                foreignField: "_id",
                as: "user"
              }
            },
    ];
    const userObjectId = userId
      ? new mongoose.Types.ObjectId(userId)
      : null;

    // Pagination
    pipeline.push(
      { $skip: skip },
      { $limit: Number(limit) }
    );
    let products = await Product.aggregate(pipeline);
    if (
      products?.length > 0 &&
      userObjectId &&
      req.user.user.role !== "admin" &&
      req.user.user.role !== "Manager"
    ) {
      const uid = userObjectId.toString();

      products = products.filter(item => {
        if (item.userId?.toString() === uid) return true;

        const processUsers = [
          item.setting?.[0]?.userId,
          item.filing?.[0]?.userId,
          item.prepolish?.[0]?.userId,
          item.polish?.[0]?.userId,
          item.repair?.[0]?.userId,
        ];

        return processUsers.some(
          u => u && u.toString() === uid
        );
      });
    }



    // Count
    const countPipeline = pipeline.filter(
      stage => !stage.$skip && !stage.$limit
    );

    countPipeline.push({ $count: "total" });

    const countResult = await Product.aggregate(countPipeline);
    const total = countResult[0]?.total || 0;

    res.json({
      products,
      pagination: {
        total,
        totalPages: Math.ceil(total / limit),
      },
    });

  } catch (err) {
    console.error(err);
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
export const deleteProduct = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    // Check product exists
    const product = await Product.findById(productId).session(session);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // 🔥 DELETE ALL RELATED PROCESS DATA
    await Promise.all([
      Setting.deleteMany({ product: productId }).session(session),
      Filing.deleteMany({ product: productId }).session(session),
      PrePolish.deleteMany({ product: productId }).session(session),
      Polish.deleteMany({ product: productId }).session(session),
      Repair.deleteMany({ product: productId }).session(session),
    ]);

    // 🔥 DELETE PRODUCT
    await Product.findByIdAndDelete(productId).session(session);

    await session.commitTransaction();
    session.endSession();

    res.json({
      success: true,
      message: "Product and related process data deleted successfully",
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
