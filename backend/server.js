// ============================
// server.js - Drone Simulator Backend
// ============================

const express = require("express");
const http = require("http");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = 5000;

// ============================
// File system setup
// ============================

// Serve static files from uploads folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Create uploads folder if it doesn’t exist
const UPLOAD_DIR = path.join(__dirname, "uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);

// Create CSV file if it doesn’t exist
const CSV_PATH = path.join(__dirname, "dataset.csv");
if (!fs.existsSync(CSV_PATH)) {
    fs.writeFileSync(
        CSV_PATH,
        "frame_id,timestamp_iso,latitude,longitude,altitude,image_path\n"
    );
}

// ============================
// Multer storage configuration
// ============================
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOAD_DIR);
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + path.extname(file.originalname);
        cb(null, uniqueName);
    },
});
const upload = multer({ storage });

// ============================
// API Routes
// ============================

// Upload frame from simulator
app.post("/upload", upload.single("image"), (req, res) => {
    const { frame_id, timestamp_iso, latitude, longitude, altitude } = req.body;
    const file = req.file;

    if (!file) {
        return res.status(400).send("No file uploaded");
    }

    // Save metadata into CSV
    const csvLine = `${frame_id},${timestamp_iso},${latitude},${longitude},${altitude},uploads/${file.filename}\n`;
    fs.appendFileSync(CSV_PATH, csvLine);

    // Debug log in terminal
    console.log(`✅ Received frame ${frame_id} -> saved as ${file.filename}`);

    // Emit to frontend
    io.emit("new_frame", {
        frame_id,
        timestamp_iso,
        latitude,
        longitude,
        altitude,
        image_url: "/uploads/" + file.filename,
    });

    res.sendStatus(200);
});

// Root endpoint
app.get("/", (req, res) => {
    res.send("🚁 Drone Simulator Backend is running!");
});

// ============================
// Socket.IO configuration
// ============================
io.on("connection", (socket) => {
    console.log("🔗 Frontend connected via Socket.IO");

    socket.on("disconnect", () => {
        console.log("❌ Frontend disconnected");
    });
});

// ============================
// Start server
// ============================
server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
