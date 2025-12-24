import mongoose from "mongoose";
import SubCategory from "../../models/Master/SubCategory.js";
import ChildCategory from "../../models/Master/ChildCategory.js";

export const addSubCategory = async (req, res, next) => {
    try {
        const { category,subCategory } = req.body;
        if (category === "" || category === undefined||subCategory === "" || subCategory === undefined) {
            throw new Error("Sub Category is required !")
        }
        const categoryData = await SubCategory.create({  category,name:subCategory})
        if (categoryData) {
            return res.status(201).json({ message: "Sub Category created Successfully", data: categoryData })
        }

    } catch (error) {
        console.log("Error during creating sub Category---> ", error)
        next(error)

    }
}

export const editSubCategory = async (req, res, next) => {
    try {
        const { subCategoryId } = req.params;
        const { category,subCategory } = req.body;
        /* ---------- Validation ---------- */
        if (!subCategoryId || !mongoose.Types.ObjectId.isValid(subCategoryId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid or missing category ID",
            });
        }
        if (!category || !subCategory.trim()||!subCategory) {
            return res.status(400).json({
                success: false,
                message: "Sub Category name is required",
            });
        }

        /* ---------- Update Category ---------- */
        const updatedCategory = await SubCategory.findByIdAndUpdate(
            subCategoryId,
            { name: subCategory.trim(),category },
            {
                new: true,        // return updated document
                runValidators: true, // enforce schema validation
            }
        );

        if (!updatedCategory) {
            return res.status(404).json({
                success: false,
                message: "Sub Category not found",
            });
        }

        /* ---------- Success Response ---------- */
        return res.status(200).json({
            success: true,
            message: "Sub Category updated successfully",
            data: updatedCategory,
        });

    } catch (error) {
        console.error("Error updating category:", error);
        next(error);
    }
};

export const deleteSubCategory = async (req, res, next) => {
  try {
    const { subCategoryId } = req.params;
    /* ---------- Validation ---------- */
    if (!subCategoryId || !mongoose.Types.ObjectId.isValid(subCategoryId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing sub category ID",
      });
    }

    /* ---------- Delete Category ---------- */
    const deletedCategory = await SubCategory.findByIdAndDelete(subCategoryId);
    if(deletedCategory){
        await ChildCategory.deleteMany({subCategory:subCategoryId})
    }

    if (!deletedCategory) {
      return res.status(404).json({
        success: false,
        message: "Sub Category not found",
      });
    }

    /* ---------- Success Response ---------- */
    return res.status(200).json({
      success: true,
      message: "Sub Category deleted successfully",
      data: deletedCategory,
    });

  } catch (error) {
    console.error("Error deleting category:", error);
    next(error);
  }
};

export const getAllSubCategories = async (req, res, next) => {
    try {
        const {category}=req.query;
         if (!category || !mongoose.Types.ObjectId.isValid(category)) {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing category ID",
      });
    }
        const categoryData = await SubCategory.find({category}).lean()
        return res.status(200).json({ message: "Category found Successfully", data: categoryData })

    } catch (error) {
        console.log("Error during creating Category---> ", error)
        next(error)

    }
}