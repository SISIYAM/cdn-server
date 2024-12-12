const API_BASE = "/api";

const uploadForm = document.getElementById("uploadForm");
const fileInput = document.getElementById("fileInput");
const imageGallery = document.getElementById("imageGallery");

// Fetch and display images
async function loadImages() {
  const res = await fetch(`${API_BASE}/files`);
  const images = await res.json();

  imageGallery.innerHTML = images
    .map(
      (img) => `
    <div>
      <img src="/files/${img}" alt="${img}" style="width: 100px; height: auto;">
      <button onclick="deleteImage('${img}')">Delete</button>
      <form onsubmit="updateImage(event, '${img}')">
        <input type="file" name="file" required>
        <button type="submit">Update</button>
      </form>
    </div>
  `
    )
    .join("");
}

// Upload a new image
uploadForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData();
  formData.append("file", fileInput.files[0]);

  const res = await fetch(`${API_BASE}/upload`, {
    method: "POST",
    body: formData,
  });

  if (res.ok) {
    alert("Image uploaded successfully");
    loadImages();
  } else {
    alert("Image upload failed");
  }
});

// Delete an image
async function deleteImage(filename) {
  const res = await fetch(`${API_BASE}/delete/${filename}`, {
    method: "DELETE",
  });

  if (res.ok) {
    alert("Image deleted successfully");
    loadImages();
  } else {
    alert("Failed to delete image");
  }
}

// Update an image
async function updateImage(e, oldFilename) {
  e.preventDefault();
  const formData = new FormData();
  const fileInput = e.target.querySelector('input[type="file"]');
  formData.append("file", fileInput.files[0]);

  const res = await fetch(`${API_BASE}/update/${oldFilename}`, {
    method: "POST",
    body: formData,
  });

  if (res.ok) {
    alert("Image updated successfully");
    loadImages();
  } else {
    alert("Failed to update image");
  }
}

// Initialize gallery
loadImages();
