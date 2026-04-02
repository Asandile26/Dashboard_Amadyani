const express = require("express");
const multer = require("multer");
const path = require("path");
const app = express();
const PORT = 8000;

// 1. Setup storage engine for receipts
const storage = multer.diskStorage({
  destination: "./uploads/receipts",
  filename: (req, file, cb) => {
    // Saves file as: MemberName-Timestamp.jpg
    cb(
      null,
      `${req.body.memberName}-${Date.now()}${path.extname(file.originalname)}`,
    );
  },
});

const upload = multer({ storage: storage });

// 2. The API Route to handle the upload
app.post("/api/upload-receipt", upload.single("receipt"), (req, res) => {
  const paymentData = {
    member: req.body.memberName,
    file: req.file.path,
    status: "pending",
    date: new Date(),
  };

  // In a real app, you'd do: db.payments.insert(paymentData)
  console.log("Logged Payment:", paymentData);

  res.status(200).send({ message: "Receipt uploaded successfully!" });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
