import Ram from "../../models/ram.js";
export const handleCreatRam = async (req, res) => {
  const { ram } = req.body;
  console.log("ram", ram);

  try {
    const newRam = await Ram({
      ram,
    });

    await newRam.save();
    return res.json({
      message: "Ram Created successfully",
      ram: newRam,
    });
  } catch (error) {
    console.log("Error while creating Ram", error);
    return res.json({ message: "Internal Server Error" });
  }
};

export const handleGetRams = async (req, res) => {
  try {
    const rams = await Ram.find({});
    return res.json({
      message: "Ram fetched successfully",
      rams: rams,
    });
  } catch (error) {
    console.log("Error while fetching Ram", error);
    return res.json({ message: "Internal Server Error" });
  }
};

export const handleUpdateRam = async (req, res) => {
  const { ram } = req.body;
  const { id } = req.params;
  console.log("id", id);
  try {
    const updatedRam = await Ram.findByIdAndUpdate(
      id,
      {
        ram,
      },
      { new: true }
    );
    if (!updatedRam) {
      return res.status(404).json({ message: "Ram not found" });
    }
    return res.json({
      message: "Ram updated successfully",
      ram: updatedRam,
    });
  } catch (error) {
    console.log("Error while updating Ram", error);
    return res.json({ message: "Internal Server Error" });
  }
};
export const handledeleteRam = async (req, res) => {
  const { id } = req.params;
  console.log("id", id);
  try {
    const deleteRam = await Ram.findByIdAndDelete(id);
    if (!deleteRam) {
      return res.status(404).json({ message: "Ram not found" });
    }
    return res.json({
      message: "Ram deleted successfully",
      ram: deleteRam,
    });
  } catch (error) {
    console.log("Error while deletiing Ram", error);
    return res.json({ message: "Internal Server Error" });
  }
};
