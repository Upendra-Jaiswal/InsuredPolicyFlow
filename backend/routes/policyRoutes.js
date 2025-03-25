import express from "express";

import User from "../models/User.js"; // Import User model
import PolicyInfo from "../models/PolicyInfo.js";
const router = express.Router();
// Search API: Find user by firstName and return policy info
router.get("/search-policy", async (req, res) => {
  try {
    const { username } = req.query; // Get username from frontend request

    if (!username) {
      return res.status(400).json({ message: "Username is required" });
    }

    // Normalize user input (lowercase + remove spaces)
    const normalizedUsername = username.toLowerCase().replace(/\s/g, "");
    console.log(normalizedUsername);

    // Search user in the database (Direct Indexed Search)
    const user = await PolicyInfo.findOne({ firstName: normalizedUsername });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    console.log("User found:", user);

    res.status(200).json({
      message: "User found",
      data: {
        policyNumber: user.policyNumber,
        startDate: user.startDate,
        endDate: user.endDate,
      },
      //   policyNumber: user.policyNumber,
    });
  } catch (error) {
    console.error("Error searching for user:", error);
    res.status(500).json({ message: "Server error" });
  }
});

//module.exports = router;

export default router;
