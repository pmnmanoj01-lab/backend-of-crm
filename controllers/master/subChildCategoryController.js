import mongoose from "mongoose";
import ChildCategory from "../../models/Master/ChildCategory.js";


export const addSubChildCategory = async (req, res, next) => {
    try {
        const { category,subCategory,childCategory } = req.body;
        if (category === "" || category === undefined||subCategory === "" || subCategory === undefined) {
            throw new Error("Sub Category is required !")
        }
        const categoryData = await ChildCategory.create({  category,name:childCategory,subCategory})
        if (categoryData) {
            return res.status(201).json({ message: "Child Category created Successfully", data: categoryData })
        }

    } catch (error) {
        console.log("Error during creating sub Category---> ", error)
        next(error)

    }
}

export const editSubChildCategory = async (req, res, next) => {
    try {
        const { subChildCategoryId } = req.params;
        const { category,subCategory,childCategory } = req.body;
        /* ---------- Validation ---------- */
        if (!subChildCategoryId || !mongoose.Types.ObjectId.isValid(subChildCategoryId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid or missing child category ID",
            });
        }
        if (!category ||!subCategory|| !subCategory.trim()||!subCategory) {
            return res.status(400).json({
                success: false,
                message: "Child Category name is required",
            });
        }

        /* ---------- Update Category ---------- */
        const updatedCategory = await ChildCategory.findByIdAndUpdate(
            subChildCategoryId,
            { name: childCategory.trim(),category,subCategory },
            {
                new: true,        // return updated document
                runValidators: true, // enforce schema validation
            }
        );

        if (!updatedCategory) {
            return res.status(404).json({
                success: false,
                message: "Child Category not found",
            });
        }

        /* ---------- Success Response ---------- */
        return res.status(200).json({
            success: true,
            message: "Child Category updated successfully",
            data: updatedCategory,
        });

    } catch (error) {
        console.error("Error updating category:", error);
        next(error);
    }
};

export const deleteSubChildCategory = async (req, res, next) => {
  try {
    const { subChildCategoryId } = req.params;

    /* ---------- Validation ---------- */
    if (!subChildCategoryId || !mongoose.Types.ObjectId.isValid(subChildCategoryId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing sub category ID",
      });
    }

    /* ---------- Delete Category ---------- */
    const deletedCategory = await ChildCategory.findByIdAndDelete(subChildCategoryId);

    if (!deletedCategory) {
      return res.status(404).json({
        success: false,
        message: "Child Category not found",
      });
    }

    /* ---------- Success Response ---------- */
    return res.status(200).json({
      success: true,
      message: "Child Category deleted successfully",
      data: deletedCategory,
    });

  } catch (error) {
    console.error("Error deleting category:", error);
    next(error);
  }
};

export const getAllSubChildCategories = async (req, res, next) => {
    try {
        const {subCategory}=req.query;
         if (!subCategory || !mongoose.Types.ObjectId.isValid(subCategory)) {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing sub  category ID",
      });
    }
        const categoryData = await ChildCategory.find({subCategory}).lean()
        return res.status(200).json({ message: "Category found Successfully", data: categoryData })

    } catch (error) {
        console.log("Error during creating Category---> ", error)
        next(error)

    }
}