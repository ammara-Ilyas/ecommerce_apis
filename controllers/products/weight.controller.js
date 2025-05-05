import Weight from "../../models/Weight.js";

export const handleCreateWeight = async (req, res) => {
  const { weight } = req.body;
  console.log("weight", weight);

  try {
    const newWeight = await Weight({
      weight,
    });

    await newWeight.save();
    return res.status(200).json({
      message: "Weight Created successfully",
      weight: newWeight,
    });
  } catch (error) {
    console.log("Error while creating weight", error);
    return res.json({ message: "Internal Server Error" });
  }
};

export const handleGetWeights = async (req, res) => {
  console.log("fetching weight");

  try {
    const weights = await Weight.find({});
    console.log("weihts", weights);

    return res.status(200).json({
      message: "Weight fetched successfully",
      weights: weights,
    });
  } catch (error) {
    console.log("Error while fetching weight", error);
    return res.json({ message: "Internal Server Error" });
  }
};

export const handleUpdateWeight = async (req, res) => {
  const { weight } = req.body;
  const { id } = req.params;
  console.log("id", id, weight);
  try {
    const updatedWeight = await Weight.findByIdAndUpdate(
      id,
      {
        weight,
      },
      { new: true }
    );
    if (!updatedWeight) {
      return res.status(404).json({ message: "Weight not found" });
    }
    return res.status(200).json({
      message: "Weight updated successfully",
      weight: updatedWeight,
    });
  } catch (error) {
    console.log("Error while updating weight", error);
    return res.json({ message: "Internal Server Error" });
  }
};
export const handledeleteWeight = async (req, res) => {
  const { id } = req.params;
  console.log("id", id);
  try {
    const deleteWeight = await Weight.findByIdAndDelete(id);
    if (!deleteWeight) {
      return res.status(404).json({ message: "Weight not found" });
    }
    return res.status(200).json({
      message: "Weight deleted successfully",
      weight: deleteWeight,
    });
  } catch (error) {
    console.log("Error while deletiing weight", error);
    return res.json({ message: "Internal Server Error" });
  }
};

export const handleDeleteMultipleWeights = async (req, res) => {
  try {
    console.log("body", req.body);

    const { ids } = req.body;
    console.log("id", ids);

    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({ message: "Invalid or missing 'id' array" });
    }

    const result = await Weight.deleteMany({
      _id: { $in: ids },
    });

    res.status(200).json({
      message: "Items deleted successfully",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Error deleting Weights:", error);
    res.status(500).json({ error: error.message });
  }
};
