import mongoose from "mongoose";

const policyCarrierSchema = new mongoose.Schema({
  companyName: { type: String, required: true },
});

const PolicyCarrier = mongoose.model("PolicyCarrier", policyCarrierSchema);

export default PolicyCarrier;
