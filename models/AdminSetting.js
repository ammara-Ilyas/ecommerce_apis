import mongoose from "mongoose";

const adminSettingsSchema = new mongoose.Schema({
  refundEnabled: { type: Boolean, default: true },
});

const AdminSettings =
  mongoose.model.AdminSettings ||
  mongoose.model("AdminSettings", adminSettingsSchema);
export default AdminSettings;
