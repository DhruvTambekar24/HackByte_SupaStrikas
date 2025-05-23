const express = require("express");
 const multer = require("multer");
 const axios = require("axios");
 const FormData = require("form-data");
 const cors = require("cors");
 const fs = require("fs");
 require("dotenv").config();
 const app = express();
 const PORT = process.env.PORT || 5000;
 app.use(cors(
   { origin: "*" } 
));
 // Pinata API Keys
 const PINATA_API_KEY = process.env.PINATA_API_KEY;
 const PINATA_SECRET_API_KEY = process.env.PINATA_SECRET_API_KEY;
 app.use(express.json()); // Middleware to parse JSON requests
 // Multer setup for file uploads
 const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Save uploaded files to 'uploads' folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
 });
 const upload = multer({ storage });
 //  Upload JSON to Pinata
 app.post("/upload-json", async (req, res) => {
  try {
    const jsonData = req.body;
    const response = await axios.post(
      "https://api.pinata.cloud/pinning/pinJSONToIPFS",
      jsonData,
      {
        headers: {
          "Content-Type": "application/json",
          pinata_api_key: PINATA_API_KEY,
          pinata_secret_api_key: PINATA_SECRET_API_KEY,
        },
      }
    );
    return res.json({ success: true, ipfsHash: response.data.IpfsHash });
  } catch (error) {
    console.error("[ ] JSON Upload Error:", error.response?.data || 
error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
 });
 //  Upload File to Pinata
 app.post("/upload-file", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: "No file uploaded" });
    const filePath = req.file.path;
    const formData = new FormData();
    formData.append("file", fs.createReadStream(filePath));
    const response = await 
axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      headers: {
        ...formData.getHeaders(),
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_SECRET_API_KEY,
      },
    });
    // Cleanup - Delete the file after upload
    fs.unlinkSync(filePath);
    return res.json({ success: true, ipfsHash: response.data.IpfsHash });
  } catch (error) {
   console.error("[ ] File Upload Error:", error.response?.data || 
error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
 });
 app.get('/getComplaints', async (req, res) => {
  try {
    const result = await axios.get('https://api.pinata.cloud/data/pinList', {
      headers: {
        pinata_api_key: 'e7f78f7984c8dc2aa46c',
        pinata_secret_api_key: 
'357fc64160301a8c90ac160922cfaeb860673380802520cec4ccf966bd32cd61',
      },
      params: {
        pageLimit: 1000,
        status: 'pinned',
        "metadata[name]": 'complaint.json'
      }
    })
    const cids = result.data.rows.map(row => row.ipfs_pin_hash)
    res.json({ cids })
  } catch (err) {
    console.error("Error fetching from Pinata:", err)
    res.status(500).json({ error: 'Failed to fetch pinned complaints.' })
  }
 })
 // Start server
  app.listen(PORT, () => console.log(` Server running on port ${PORT}`));