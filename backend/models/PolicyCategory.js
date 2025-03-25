import mongoose from "mongoose";

const policyCategorySchema = new mongoose.Schema({
  categoryName: { type: String, required: true },
});

const PolicyCategory = mongoose.model("PolicyCategory", policyCategorySchema);

export default PolicyCategory;
