require("dotenv").config();
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const streamifier = require("streamifier");

const connectDB = require("./config/db");
const cloudinary = require("./config/cloudinary");
const Payment = require("./models/Payment");

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());

// Keep the file in memory only — we stream it straight to Cloudinary,
// so we never touch disk.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB cap
});

function uploadToCloudinary(buffer, publicId) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "receipts",
        public_id: publicId,
        resource_type: "auto", // handles both images and PDFs
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      },
    );
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
}

app.post("/api/upload-receipt", upload.single("receipt"), async (req, res) => {
  try {
    const { memberName, email } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    if (!memberName || !email) {
      return res
        .status(400)
        .json({ message: "memberName and email are required" });
    }

    const safeName = memberName.replace(/[^a-z0-9]/gi, "_");
    const publicId = `${safeName}-${Date.now()}`;

    const result = await uploadToCloudinary(req.file.buffer, publicId);

    const payment = await Payment.create({
      memberName,
      email,
      fileUrl: result.secure_url,
      fileName: req.file.originalname,
      status: "pending",
    });

    res
      .status(200)
      .json({ message: "Receipt uploaded successfully!", payment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// A dashboard needs something to list — this is the minimum for that.
app.get("/api/payments", async (req, res) => {
  const payments = await Payment.find().sort({ date: -1 });
  res.json(payments);
});

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("Failed to start server:", err);
    process.exit(1);
  });
