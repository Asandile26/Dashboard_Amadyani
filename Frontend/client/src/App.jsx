import { useState } from "react";
import axios from "axios";
import "./app.css";
export default function PaymentForm() {
  const [memberData, setMemberData] = useState({ name: "", email: "" });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please select a file");

    setLoading(true);
    const formData = new FormData();
    formData.append("receipt", file);
    formData.append("name", memberData.name);
    formData.append("email", memberData.email);

    try {
      // Ensure your vite.config.js has the proxy set for /api
      const response = await axios.post("/api/upload-receipt", formData);

      alert("Success! Receipt logged for " + memberData.name);

      // Reset Form after success
      setMemberData({ name: "", email: "" });
      setFile(null);
      e.target.reset(); // Resets the file input visually
    } catch (err) {
      console.error(err);
      alert("Upload failed. Make sure your server is running on port 5000.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="payment-container">
      <h2>Society Portal</h2>
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label for="name" id="labelName">
            Full Name
          </label>
          <input
            className="name"
            type="text"
            placeholder="John Doe"
            value={memberData.name}
            onChange={(e) =>
              setMemberData({ ...memberData, name: e.target.value })
            }
            required
          />
        </div>

        <div className="input-group">
          <label for="email" id="labelName">
            Email Address
          </label>
          <input
            className="email"
            type="email"
            placeholder="john@example.com"
            value={memberData.email}
            onChange={(e) =>
              setMemberData({ ...memberData, email: e.target.value })
            }
            required
          />
        </div>

        <div className="input-group">
          <label for="payment" id="paymentLabel">
            Payment Receipt
          </label>
          <input
            className="payment"
            type="file"
            accept="image/*,.pdf"
            onChange={(e) => setFile(e.target.files[0])}
            required
          />
        </div>

        <button type="submit" disabled={loading} className="submit-Btn">
          {loading ? "Processing..." : "Submit Proof of Payment"}
        </button>
      </form>
    </div>
  );
}
