import express from "express";
import multer from "multer";
import { Worker } from "worker_threads";
import path from "path";
import fs from "fs";

const router = express.Router();

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});

const upload = multer({ storage });

// API to handle file upload
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const worker = new Worker(path.resolve("workers/uploadWorker.js"), {
      workerData: { filePath: req.file.path },
    });

    worker.on("message", (message) => {
      res.status(200).json({ message });
    });

    worker.on("error", (error) => {
      console.error("Worker error:", error);
      res.status(500).json({ error: "Worker thread failed" });
    });

    worker.on("exit", (code) => {
      if (code !== 0) console.error(`Worker stopped with exit code ${code}`);
    });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
