import mongoose from "mongoose";

const policyInfoSchema = new mongoose.Schema({
  policyNumber: { type: String },
  startDate: { type: String },
  endDate: { type: String },
  firstName: {
    type: String,
    set: (value) => value.toLowerCase().replace(/\s/g, ""), // Transform before saving
    index: true, // Ensure fast lookups
  },
  // categoryId: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: "PolicyCategory",
  //   required: true,
  // },
  // companyId: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: "PolicyCarrier",
  //   required: true,
  // },
  // userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
});

export default mongoose.model("PolicyInfo", policyInfoSchema);
