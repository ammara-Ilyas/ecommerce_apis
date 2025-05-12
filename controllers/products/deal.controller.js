import Deal from "../../models/Deals.js";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

export const handleCreateDeal = async (req, res) => {
  const { name } = req.body;

  console.log("deal create 1", name);

  try {
    let imageUrl = "/public/uploads/dummy.png";

    // Upload to Cloudinary if image provided
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "deals",
      });
      imageUrl = result.secure_url;
      console.log("imageUrl", imageUrl);
      //   console.log("image req file", req.file.path);

      // Remove local file
      fs.unlinkSync(req.file.path);
    }
    console.log("deals Exist create 2", name, imageUrl);

    const newDeal = await Deal({
      name,
      image: imageUrl,
    });
    newDeal.save();
    return res.status(200).json({
      message: "deals created successfully",
      deal: newDeal,
    });
  } catch (error) {
    console.log("Error creating deals", error);
    return res.json({ message: "Internal Server Error" });
  }
};

export const handleGetDeals = async (req, res) => {
  console.log("get all deals");

  try {
    const deal = await Deal.find({});
    return res.status(200).json({
      message: "deal fetched successfully",
      deal: deal,
    });
  } catch (error) {
    console.log("Error getting deal", error);
    return res.json({ message: "Internal Server Error" });
  }
};

export const handleUpdateDeal = async (req, res) => {
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

    const updateDeal = await Deal.findByIdAndUpdate(
      id,
      {
        name,

        image: imageUrl,
      },
      { new: true }
    );

    if (!updateDeal) {
      return res.status(404).json({ message: "Deal not found" });
    }
    return res.status(200).json({
      message: "Deal updated successfully",
      updateDeal: updateDeal,
    });
  } catch (error) {
    console.log("Error updating Deal", error);
    return res.json({ message: "Internal Server Error" });
  }
};

export const handleDeleteDeal = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedDeal = await Deal.findByIdAndDelete(id);
    if (!deletedDeal) {
      return res.status(404).json({
        message: "Deal not found",
      });
    }
    return res.status(200).json({
      message: "Deal deleted successfully",
      deleteDeal: deletedDeal,
    });
  } catch (error) {
    return res.status(400).json({
      message: "Error deleting Deal",
    });
  }
};

export const handleDeleteMultipleDeals = async (req, res) => {
  try {
    console.log("body", req.body);

    const { ids } = req.body;
    console.log("id", ids);

    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({ message: "Invalid or missing 'id' array" });
    }

    const result = await Deal.deleteMany({
      _id: { $in: ids },
    });

    res.status(200).json({
      message: "Items deleted successfully",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Error deleting Deals:", error);
    res.status(500).json({ error: error.message });
  }
};
