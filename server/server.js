const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Route contoh
app.get("/api/message", (req, res) => {
  res.json({ message: "Halo dari backend Node.js!" });
});

app.get("/", (req, res) => {
  res.send("Server backend aktif! Coba buka /api/message untuk melihat JSON.");
});

// Jalankan server
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});