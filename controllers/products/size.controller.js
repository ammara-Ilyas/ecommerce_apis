import Size from "../../models/Size.js";
export const handleCreateSize = async (req, res) => {
  const { size } = req.body;
  console.log("size", size);

  try {
    const newSize = await Size({
      size,
    });

    await newSize.save();
    return res.json({
      message: "Size Created successfully",
      size: newSize,
    });
  } catch (error) {
    console.log("Error while creating size", error);
    return res.json({ message: "Internal Server Error" });
  }
};

export const handleGetSizes = async (req, res) => {
  try {
    const sizes = await Size.find({});
    return res.json({
      message: "Size fetched successfully",
      sizes: sizes,
    });
  } catch (error) {
    console.log("Error while fetching size", error);
    return res.json({ message: "Internal Server Error" });
  }
};

export const handleUpdateSize = async (req, res) => {
  const { size } = req.body;
  const { id } = req.params;
  console.log("id", id);
  try {
    const updatedsize = await Size.findByIdAndUpdate(
      id,
      {
        size,
      },
      { new: true }
    );
    if (!updatedsize) {
      return res.status(404).json({ message: "Size not found" });
    }
    return res.json({
      message: "size updated successfully",
      size: updatedsize,
    });
  } catch (error) {
    console.log("Error while updating size", error);
    return res.json({ message: "Internal Server Error" });
  }
};
export const handleDeleteSize = async (req, res) => {
  const { id } = req.params;
  console.log("id", id);
  try {
    const deletesize = await Size.findByIdAndDelete(id);
    if (!deletesize) {
      return res.status(404).json({ message: "size not found" });
    }
    return res.json({
      message: "Size deleted successfully",
      size: deletesize,
    });
  } catch (error) {
    console.log("Error while deleting size", error);
    return res.json({ message: "Internal Server Error" });
  }
};
