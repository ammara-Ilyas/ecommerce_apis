import Category from "../models/Category.js";
import SubCategory from "../models/Subcategory.js";
export const handleCreateSubCategory = async (req, res) => {
  console.log("➡️ req.body raw:", req.body);
  console.log("➡️ Headers:", req.headers["content-type"]);
  const { name, category_id } = req.body;
  console.log("name", name, category_id);
  console.log("body", req.body);
  const subCategoryExist = await SubCategory.findOne({ name });
  if (subCategoryExist) {
    return res.status(400).json({ message: "Sub Category already exists" });
  }
  const categoryExists = await Category.findOne({ _id: category_id });

  if (!categoryExists) {
    return res.status(400).json({ message: "Category does not exist" });
  }
  try {
    const newSubCategory = await SubCategory({
      name,
      category_id,
    });
    await newSubCategory.save();
    return res.status(201).json({
      message: "Sub Category created successfully",
      SubCategory: newSubCategory,
    });
  } catch (error) {
    console.log("Error creating Sub Category", error);
    return res.status(400).json({ message: "Internal Server Error" });
  }
};

export const handleUpdateSubCategory = async (req, res) => {
  const { name, category_id } = req.body;
  const { id } = req.params;
  console.log("name", name, category_id);

  // const categoryExists = await Category.findOne(category_id);
  // if (!categoryExists) {
  //   return res.status(400).json({ message: "Category does not exist" });
  // }
  try {
    const updateSubCategory = await SubCategory.findByIdAndUpdate(
      id,
      {
        name,
        category_id,
      },
      { new: true }
    );
    if (!updateSubCategory) {
      return res.status(404).json({ message: "Sub Category not found" });
    }
    return res.status(201).json({
      message: "Sub Category updated successfully",
      SubCategory: updateSubCategory,
    });
  } catch (error) {
    console.log("Error updating Sub Category", error);
    return res.status(400).json({ message: "Internal Server Error" });
  }
};

export const handleGetSubCategory = async (req, res) => {
  try {
    const subCategories = await SubCategory.find().populate("category_id");
    return res.status(201).json({
      message: "Sub Category created successfully",
      SubCategories: subCategories,
    });
  } catch (error) {
    console.log("Error getting Sub Category", error);
    return res.status(400).json({ message: "Internal Server Error" });
  }
};

export const handledeleteSubCategory = async (req, res) => {
  const { name, category_id } = req.body;
  const { id } = req.params;
  console.log("name", name, category_id);

  const categoryExists = await Category.findOne(category_id);
  if (!categoryExists) {
    return res.status(400).json({ message: "Category does not exist" });
  }
  try {
    const updateSubCategory = await SubCategory.findByIdAndDelete(id);
    if (!updateSubCategory) {
      return res.status(404).json({ message: "Sub Category not found" });
    }
    return res.status(201).json({
      message: "Sub Category deleted successfully",
      SubCategory: updateSubCategory,
    });
  } catch (error) {
    console.log("Error deleting Sub Category", error);
    return res.status(400).json({ message: "Internal Server Error" });
  }
};
