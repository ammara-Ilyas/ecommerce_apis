import Category from "../models/Category.js";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

export const handleCreateCategory = async (req, res) => {
  const { name, color, subCategory } = req.body;

  const categoryExist = await Category.findOne({ name });
  if (categoryExist) {
    return res.status(400).json({
      message: "Category already exists",
    });
  }
  console.log("categoryExist create 1", name, color);

  try {
    let imageUrl = "/public/uploads/dummy.png";

    // Upload to Cloudinary if image provided
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "categories",
      });
      imageUrl = result.secure_url;
      console.log("imageUrl", imageUrl);
      console.log("image req file", req.file.path);

      // Remove local file
      fs.unlinkSync(req.file.path);
    }
    console.log("categoryExist create 2", name, color, imageUrl);

    const newCategory = await Category({
      name,
      color,
      image: imageUrl,
    });
    newCategory.save();
    return res.status(201).json({
      message: "Category created successfully",
      Category: newCategory,
    });
  } catch (error) {
    console.log("Error creating category", error);
    return res.json({ message: "Internal Server Error" });
  }
};

export const handleGetCategories = async (req, res) => {
  console.log("get all categoryies");

  try {
    const categories = await Category.find({});
    return res.status(200).json({
      message: "Categories fetched successfully",
      categories: categories,
    });
  } catch (error) {
    console.log("Error getting categories", error);
    return res.json({ message: "Internal Server Error" });
  }
};

export const handleUpdateCategory = async (req, res) => {
  const { name, color } = req.body;

  const { id } = req.params;
  console.log("id", id);
  console.log("name", name, color);

  try {
    let imageUrl;

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "categories",
      });
      imageUrl = result.secure_url;

      fs.unlinkSync(req.file.path); // remove local
    }

    const updateData = {
      name,
      color,
    };

    if (imageUrl) {
      updateData.image = imageUrl;
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      {
        name,
        color,
        image: imageUrl,
      },
      { new: true }
    );

    if (!updatedCategory) {
      return res.status(404).json({ message: "Category not found" });
    }
    return res.status(201).json({
      message: "Category updated successfully",
      updateCategory: updatedCategory,
    });
  } catch (error) {
    console.log("Error updating category", error);
    return res.json({ message: "Internal Server Error" });
  }
};

export const handleDeleteCategory = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedCategory = await Category.findByIdAndDelete(id);
    if (!deletedCategory) {
      return res.status(404).json({
        message: "Category not found",
      });
    }
    return res.status(201).json({
      message: "Category deleted successfully",
      deleteCategory: deletedCategory,
    });
  } catch (error) {
    return res.status(400).json({
      message: "Error deleting category",
    });
  }
};

export const handleDeleteMultipleCategorys = async (req, res) => {
  try {
    console.log("body", req.body);

    const { ids } = req.body;
    console.log("id", ids);

    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({ message: "Invalid or missing 'id' array" });
    }

    const result = await Category.deleteMany({
      _id: { $in: ids },
    });

    res.status(200).json({
      message: "Items deleted successfully",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Error deleting Categorys:", error);
    res.status(500).json({ error: error.message });
  }
};
