const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

const UPLOAD_DIR = path.join(__dirname, "uploads");

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

app.get("/", (req, res) => {
  const files = fs.readdirSync(UPLOAD_DIR).map((file) => ({
    name: file,
    url: `/files/${file}`,
  }));

  res.render("index", { files });
});

app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "File upload failed" });
  }

  const fileUrl = `${req.protocol}://${req.get("host")}/files/${
    req.file.filename
  }`;
  console.log(`File uploaded successfully: ${fileUrl}`);

  res.redirect("/");
});

app.post("/update/:filename", upload.single("file"), (req, res) => {
  const oldFilename = req.params.filename;
  const oldFilePath = path.join(UPLOAD_DIR, oldFilename);

  if (!req.file) {
    return res.status(400).json({ error: "No file provided for update" });
  }

  // Delete the old file
  fs.unlink(oldFilePath, (err) => {
    if (err) {
      console.error(`Failed to delete old file: ${err.message}`);
      return res.status(404).json({ error: "Original file not found" });
    }

    console.log(`File ${oldFilename} replaced with ${req.file.filename}`);
    res.redirect("/");
  });
});

app.use("/files", express.static(UPLOAD_DIR));

app.post("/delete/:filename", (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(UPLOAD_DIR, filename);

  fs.unlink(filePath, (err) => {
    if (err) {
      return res.status(404).json({ error: "File not found" });
    }
    res.redirect("/");
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
