import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    set: (value) => value.toLowerCase().replace(/\s/g, ""), // Transform before saving
    index: true, // Ensure fast lookups
  },
  dob: { type: String},
  //{ type: Date, required: true },
  address: { type: String },
  phone: { type: String },
  state: { type: String },
  zipCode: { type: String},
  email: { type: String},
  gender: { type: String },
  // gender: { type: String, enum: ["Male", "Female", "Other"] },
  userType: { type: String },
});

const User = mongoose.model("User", userSchema);
export default User;
