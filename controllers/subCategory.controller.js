import Category from "../models/Category.js";
import mongoose from "mongoose";
export const addSubCategory = async (req, res) => {
  try {
    const { category_name, newSubCategories } = req.body;
    console.log(
      "category_name",
      category_name,
      "sub categry",
      newSubCategories
    );

    // Check if category name and subcategories array are provided
    if (!newSubCategories) {
      return res.status(400).json({ message: "Subcategories are required." });
    }

    const category = await Category.findOne({ name: category_name });

    if (!category) {
      return res.status(404).json({ message: "Category not found." });
    }

    for (let subCategory of newSubCategories) {
      // check for existing subcategory by name
      const alreadyExists = category.subCategory.some(
        (item) => item.name === subCategory
      );

      if (alreadyExists) {
        return res
          .status(400)
          .json({ message: `Subcategory "${subCategory}" already exists.` });
      } else {
        category.subCategory.push({ name: subCategory });
      }
    }

    // Save the updated category
    const newCategory = await category.save();

    res.status(200).json({
      message: "Subcategories added successfully.",
      category: newCategory,
    });
  } catch (error) {
    console.error("Error adding subcategories:", error);
    res.status(500).json({ message: "Internal Server error." });
  }
};

//// update sub category
export const updateSubCategory = async (req, res) => {
  try {
    const { category_id } = req.params;
    const { oldSubCategory, newSubCategory } = req.body;

    if (!category_id || !oldSubCategory || !newSubCategory) {
      return res.status(400).json({ message: "Required fields are missing." });
    }

    const category = await Category.findById(category_id);

    if (!category) {
      return res.status(404).json({ message: "Category not found." });
    }

    // Find the index of the subcategory to update
    const index = category.subCategory.findIndex(
      (sub) => sub.name.toLowerCase() === oldSubCategory.toLowerCase()
    );

    if (index === -1) {
      return res.status(404).json({ message: "Subcategory not found." });
    }

    // Update subcategory name
    category.subCategory[index].name = newSubCategory;
    await category.save();

    res.status(200).json({
      message: "Subcategory updated successfully.",
      category,
    });
  } catch (error) {
    console.error("Error updating subcategory:", error);
    res.status(500).json({ message: "Internal Server error." });
  }
};

//// for get sub categegoires
export const getCategoryWithSubCategories = async (req, res) => {
  try {
    const { category_id } = req.params;

    if (!category_id) {
      return res.status(400).json({ message: "category_id is required." });
    }

    const category = await Category.findById(category_id);

    if (!category) {
      return res.status(404).json({ message: "Category not found." });
    }

    res
      .status(200)
      .json({ message: "Category fetched successfully.", category });
  } catch (error) {
    console.error("Error fetching category:", error);
    res.status(500).json({ message: "Internal Server error." });
  }
};

/////for delete
export const deleteSubCategory = async (req, res) => {
  try {
    const { subCategory_id, category_name } = req.params;
    console.log("body", category_name, "and", subCategory_id);

    // const { category_name } = req.body;
    console.log("name", category_name);

    if (!category_name || !subCategory_id) {
      return res
        .status(400)
        .json({ message: "subCategory_id and category_name are required." });
    }

    const category = await Category.findOne({ name: category_name });

    if (!category) {
      return res.status(404).json({ message: "Category not found." });
    }

    const initialLength = category.subCategory.length;

    // Filter out the subcategory by ID
    category.subCategory = category.subCategory.filter(
      (sub) => sub._id.toString() !== subCategory_id
    );

    if (category.subCategory.length === initialLength) {
      return res
        .status(404)
        .json({ message: "Subcategory not found in category." });
    }

    const deleteSubCate = await category.save();

    res.status(200).json({
      message: "Subcategory deleted successfully.",
      category: deleteSubCate,
    });
  } catch (error) {
    console.error("Error deleting subcategory:", error);
    res.status(500).json({ message: "Internal Server error." });
  }
};
