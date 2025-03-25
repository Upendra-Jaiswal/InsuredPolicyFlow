import mongoose from "mongoose";


// MongoDB Connection
const connectDB = async () => {
  try {
    // await mongoose.connect("mongodb://localhost:27017/yourDatabaseName", {
    //   useNewUrlParser: true,
    //   useUnifiedTopology: true,
    // });
    // console.log("MongoDB Connected");

    await mongoose.connect(process.env.MONGO_URI).then(() => {
      console.log("DB Connected");
    });
  } catch (error) {
    console.error("MongoDB Connection Error:", error);
    parentPort.postMessage({ error: "Database connection failed" });
    process.exit(1); // Exit worker on failure
  }
};

export default connectDB;
