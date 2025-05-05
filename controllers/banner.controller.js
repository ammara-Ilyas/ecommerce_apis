import Banner from "../models/Banner.js";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

export const handleCreateBanner = async (req, res) => {
  const { name } = req.body;

  console.log("BannerExist create 1", name);

  try {
    let imageUrl = "/public/uploads/dummy.png";

    // Upload to Cloudinary if image provided
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "banners",
      });
      imageUrl = result.secure_url;
      console.log("imageUrl", imageUrl);
      //   console.log("image req file", req.file.path);

      // Remove local file
      fs.unlinkSync(req.file.path);
    }
    console.log("Banner Exist create 2", name, imageUrl);

    const newBanner = await Banner({
      name,
      image: imageUrl,
    });
    newBanner.save();
    return res.status(200).json({
      message: "Banner created successfully",
      Banner: newBanner,
    });
  } catch (error) {
    console.log("Error creating Banner", error);
    return res.json({ message: "Internal Server Error" });
  }
};

export const handleGetBanners = async (req, res) => {
  console.log("get all Banneries");

  try {
    const banners = await Banner.find({});
    return res.status(200).json({
      message: "banners fetched successfully",
      banners: banners,
    });
  } catch (error) {
    console.log("Error getting banners", error);
    return res.json({ message: "Internal Server Error" });
  }
};

export const handleUpdateBanner = async (req, res) => {
  const { name } = req.body;

  const { id } = req.params;
  console.log("id", id);
  console.log("name", name);

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
    };

    if (imageUrl) {
      updateData.image = imageUrl;
    }

    const updatedBanner = await Banner.findByIdAndUpdate(
      id,
      {
        name,

        image: imageUrl,
      },
      { new: true }
    );

    if (!updatedBanner) {
      return res.status(404).json({ message: "Banner not found" });
    }
    return res.status(200).json({
      message: "Banner updated successfully",
      updateBanner: updatedBanner,
    });
  } catch (error) {
    console.log("Error updating Banner", error);
    return res.json({ message: "Internal Server Error" });
  }
};

export const handleDeleteBanner = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedBanner = await Banner.findByIdAndDelete(id);
    if (!deletedBanner) {
      return res.status(404).json({
        message: "Banner not found",
      });
    }
    return res.status(200).json({
      message: "Banner deleted successfully",
      deleteBanner: deletedBanner,
    });
  } catch (error) {
    return res.status(400).json({
      message: "Error deleting Banner",
    });
  }
};

export const handleDeleteMultipleBanners = async (req, res) => {
  try {
    console.log("body", req.body);

    const { ids } = req.body;
    console.log("id", ids);

    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({ message: "Invalid or missing 'id' array" });
    }

    const result = await Banner.deleteMany({
      _id: { $in: ids },
    });

    res.status(200).json({
      message: "Items deleted successfully",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Error deleting Banners:", error);
    res.status(500).json({ error: error.message });
  }
};
