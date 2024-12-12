const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

const UPLOAD_DIR = path.join(__dirname, "uploads");

// ensure the uploads directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// middleware for parsing JSON
app.use(express.json());

app.get("/", (req, res) => {
  res.render("index.ejs");
});

// upload a new file
app.post("/api/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "File upload failed" });
  }

  const filePath = `/files/${req.file.filename}`;
  console.log(`File uploaded successfully: ${filePath}`);
  res
    .status(200)
    .json({ message: "File uploaded successfully", path: filePath });
});

// update an existing file
app.post("/api/update/:filename", upload.single("file"), (req, res) => {
  const oldFilename = req.params.filename;
  const oldFilePath = path.join(UPLOAD_DIR, oldFilename);

  if (!req.file) {
    return res.status(400).json({ error: "No file provided for update" });
  }

  fs.unlink(oldFilePath, (err) => {
    if (err) {
      console.error(`Failed to delete old file: ${err.message}`);
      return res.status(404).json({ error: "Original file not found" });
    }

    const newFilePath = `/files/${req.file.filename}`;
    console.log(`File ${oldFilename} replaced with ${req.file.filename}`);
    res
      .status(200)
      .json({ message: "File updated successfully", path: newFilePath });
  });
});

// delete a file
app.delete("/api/delete/:filename", (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(UPLOAD_DIR, filename);

  fs.unlink(filePath, (err) => {
    if (err) {
      console.error(`File deletion failed: ${err.message}`);
      return res.status(404).json({ error: "File not found" });
    }

    res.status(200).json({ message: "File deleted successfully" });
  });
});
// Get all uploaded files
app.get("/api/files", (req, res) => {
  fs.readdir(UPLOAD_DIR, (err, files) => {
    if (err) {
      return res.status(500).json({ error: "Failed to list files" });
    }
    console.log(files);
    res.status(200).json(files);
  });
});

// rename a file
app.post("/api/rename/:filename", (req, res) => {
  const oldFilename = req.params.filename;
  const newFilename = `${Date.now()}${path.extname(req.body.newName)}`;
  const oldFilePath = path.join(UPLOAD_DIR, oldFilename);
  const newFilePath = path.join(UPLOAD_DIR, newFilename);

  if (!req.body.newName) {
    return res.status(400).json({ error: "New file name is required" });
  }

  fs.rename(oldFilePath, newFilePath, (err) => {
    if (err) {
      console.error(`File rename failed: ${err.message}`);
      return res.status(404).json({ error: "File not found" });
    }

    console.log(`File ${oldFilename} renamed to ${newFilename}`);
    res.status(200).json({
      message: "File renamed successfully",
      path: `/files/${newFilename}`,
    });
  });
});

// Serve static files
app.use("/files", express.static(UPLOAD_DIR));

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
