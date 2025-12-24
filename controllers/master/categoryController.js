import mongoose from "mongoose";
import Category from "../../models/Master/Category.js";
import SubCategory from "../../models/Master/SubCategory.js";
import ChildCategory from "../../models/Master/ChildCategory.js";

export const addCategory = async (req, res, next) => {
    try {
        const { category } = req.body;
        if (category === "" || category === undefined) {
            throw new Error("Category is required !")
        }
        const categoryData = await Category.create({ name: category })
        if (categoryData) {
            return res.status(201).json({ message: "Category created Successfully", data: categoryData })
        }

    } catch (error) {
        console.log("Error during creating Category---> ", error)
        next(error)

    }
}

export const editCategory = async (req, res, next) => {
    try {
        const { categoryId } = req.params;
        const { category } = req.body;
        /* ---------- Validation ---------- */
        if (!categoryId || !mongoose.Types.ObjectId.isValid(categoryId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid or missing category ID",
            });
        }
        if (!category || !category.trim()) {
            return res.status(400).json({
                success: false,
                message: "Category name is required",
            });
        }

        /* ---------- Update Category ---------- */
        const updatedCategory = await Category.findByIdAndUpdate(
            categoryId,
            { name: category.trim() },
            {
                new: true,        // return updated document
                runValidators: true, // enforce schema validation
            }
        );

        if (!updatedCategory) {
            return res.status(404).json({
                success: false,
                message: "Category not found",
            });
        }

        /* ---------- Success Response ---------- */
        return res.status(200).json({
            success: true,
            message: "Category updated successfully",
            data: updatedCategory,
        });

    } catch (error) {
        console.error("Error updating category:", error);
        next(error);
    }
};

export const deleteCategory = async (req, res, next) => {
  try {
    const { categoryId } = req.params;

    /* ---------- Validation ---------- */
    if (!categoryId || !mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing category ID",
      });
    }
    /* ---------- Delete Category ---------- */
    const deletedCategory = await Category.findByIdAndDelete(categoryId);
    if(deletedCategory){
        await SubCategory.deleteMany({category:categoryId});
        await ChildCategory.deleteMany({category:categoryId});
    }
    if (!deletedCategory) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    /* ---------- Success Response ---------- */
    return res.status(200).json({
      success: true,
      message: "Category deleted successfully",
      data: deletedCategory,
    });

  } catch (error) {
    console.error("Error deleting category:", error);
    next(error);
  }
};

export const getAllCategories = async (_, res, next) => {
    try {
        const categoryData = await Category.find().lean()
        return res.status(200).json({ message: "Category created Successfully", data: categoryData })

    } catch (error) {
        console.log("Error during creating Category---> ", error)
        next(error)

    }
}