import mongoose from "mongoose";

const userAccountSchema = new mongoose.Schema({
  userAccountName: { type: String, required: true },
 // userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
});

const UserAccount = mongoose.model("UserAccount", userAccountSchema);

export default UserAccount;

//export default mongoose.model("UserAccount", userAccountSchema);
