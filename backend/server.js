import express from "express";
import mongoose from "mongoose";
import multer from "multer";
import { Worker } from "worker_threads";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import cors from "cors";
//MONGO_URI=mongodb+srv://developeruj:FYmP06Ck5RabHY9t@cluster0.om2ce.mongodb.net/
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import policyRoutes from "./routes/policyRoutes.js";
import connectDB from "./config/db.js";

const app = express();
const PORT = process.env.PORT || 3001;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import "dotenv/config";



app.use(express.json());

app.use(cookieParser());

app.use(bodyParser.json()); // Parse JSON bodies
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded bodies

const allowedOrigins = process.env.ORIGIN;

//const allowedOrigins = "http://localhost:5173"

const corsOptions = {
  origin: allowedOrigins,
  methods: ["POST", "GET", "PUT", "DELETE", "PATCH"],
  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));

dotenv.config();

// // MongoDB Connection
// const connectDB = async () => {
//   try {
//     // await mongoose.connect("mongodb://localhost:27017/yourDatabaseName", {
//     //   useNewUrlParser: true,
//     //   useUnifiedTopology: true,
//     // });
//     // console.log("MongoDB Connected");

//     await mongoose.connect(process.env.MONGO_URI).then(() => {
//       console.log("DB Connected");
//     });
//   } catch (error) {
//     console.error("MongoDB Connection Error:", error);
//     parentPort.postMessage({ error: "Database connection failed" });
//     process.exit(1); // Exit worker on failure
//   }
// };

connectDB();

// Store files directly on disk
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = "uploads/";
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

app.post("/upload", upload.single("file"), (req, res) => {
 

  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const filePath = path.resolve(req.file.path);

  // Create worker thread to handle file processing
  const worker = new Worker("./workers/uploadWorker.js", {
    workerData: { filePath },
  });

  worker.on("message", (message) => {
    res.json({
      message: "File uploaded and processed",
      filePath,
      result: message,
    });
  });

  worker.on("error", (error) => {
    res.status(500).json({ message: "File processing failed", error });
  });
});


app.use('/api/users', policyRoutes); // Use user routes

// // Multer setup for file upload
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => cb(null, "uploads/"),
//   filename: (req, file, cb) => cb(null, file.originalname),
// });
// const upload = multer({ storage });

// // Upload API
// app.post("/upload", upload.single("file"), (req, res) => {
//   if (!req.file) return res.status(400).json({ error: "No file uploaded" });

//   //console.log("reached here")

//   const worker = new Worker("./uploadWorker.js", {
//     workerData: { filePath: path.resolve("uploads", req.file.filename) },

//   });
//   // console.log(worker);

//   // console.log(workerData);

//   worker.on("message", (message) => res.json({ message }));
//   worker.on("error", (error) => res.status(500).json({ error: error.message }));
//   worker.on("exit", (code) => {
//     if (code !== 0) console.error(`Worker exited with code ${code}`);
//   });
// });

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
