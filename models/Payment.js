const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  memberName: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  fileUrl: { type: String, required: true },
  fileName: { type: String, required: true },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Payment", paymentSchema);
