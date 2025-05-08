import Product from "../../models/Product.js";
import { v2 as cloudinary } from "cloudinary";
import Category from "../../models/Category.js";
import fs from "fs";

export const handleCreateProduct = async (req, res) => {
  const {
    product,
    description,
    newPrice,
    oldPrice,
    category,
    subCategory,
    weight,
    ram,
    size,
    brand,
    stock,
    discount,
    rating,
    istopSeller,
    isFeatured,
    isNewArrival,
  } = req.body;
  console.log("info", req.body);

  try {
    let imageUrls = [];

    // Upload images to Cloudinary if provided
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: "products", // you can change folder if needed
        });
        imageUrls.push(result.secure_url);
        // After uploading, remove local file
        fs.unlinkSync(file.path);
      }
    } else {
      // Default dummy image if no file uploaded
      imageUrls.push("/public/uploads/dummy.png");
    }
    console.log("images", imageUrls);

    // Create new product
    const newProduct = await Product({
      product,
      description,
      newPrice,
      oldPrice,
      category,
      subCategory,
      weight,
      ram,
      size,
      brand,
      stock,
      discount,
      rating,
      isNewArrival,
      istopSeller,
      isFeatured,
      images: imageUrls,
    });

    await newProduct.save();

    return res.status(200).json({
      message: "Product created successfully",
      product: newProduct,
    });
  } catch (error) {
    console.error("Error while creating product", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const handleGetProducts = async (req, res) => {
  try {
    const products = await Product.find({}).populate([
      { path: "weight" },
      { path: "size" },
      { path: "ram" },
      { path: "category" },
    ]);
    // console.log("products", products);

    return res.status(200).json({
      message: "Products fetched successfully",
      products: products,
    });
  } catch (error) {
    console.log("Error while fetching products", error);
    res.status(500).json({
      message: "Failed to fetch products",
      error: error.message,
    });
  }
};

export const handleUpdateProduct = async (req, res) => {
  const { id } = req.params;
  const {
    product,
    description,
    newPrice,
    oldPrice,
    category,
    subCategory,
    weight,
    ram,
    size,
    brand,
    stock,
    discount,
    rating,
    isNewArrival,
    istopSeller,
    isFeatured,
  } = req.body;

  try {
    let imageUrls = [];

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: "products",
        });
        imageUrls.push(result.secure_url);
        fs.unlinkSync(file.path);
      }
    }

    const updatedData = {
      product,
      description,
      newPrice,
      oldPrice,
      category,
      subCategory,
      weight,
      ram,
      size,
      brand,
      stock,
      discount,
      rating,
      isNewArrival,
      istopSeller,
      isFeatured,
    };

    if (imageUrls.length > 0) {
      updatedData.images = imageUrls;
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, updatedData, {
      new: true,
    });

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.status(200).json({
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Error updating product", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const handleDeleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedProduct = await Product.findByIdAndDelete(id);
    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }
    return res.status(200).json({
      message: "Product deleted successfully",
      deltedProduct: deletedProduct,
    });
  } catch (error) {
    console.error("Error deleting product", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const handleDeleteMultipleProducts = async (req, res) => {
  try {
    console.log("body", req.body);

    const { ids } = req.body;
    console.log("id", ids);

    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({ message: "Invalid or missing 'id' array" });
    }

    const result = await Product.deleteMany({
      _id: { $in: ids },
    });

    res.status(200).json({
      message: "Items deleted successfully",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Error deleting products:", error);
    res.status(500).json({ error: error.message });
  }
};

export const handleGetProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id).populate([
      { path: "weight" },
      { path: "size" },
      { path: "ram" },
      { path: "category" },
      { path: "subCategory" },
    ]);

    console.log("produt", product);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    return res.status(200).json({
      message: "Product fetched successfully",
      product: product,
    });
  } catch (error) {
    console.log("Error while fetching product by ID", error);
    res.status(500).json({
      message: "Failed to fetch product",
      error: error.message,
    });
  }
};
