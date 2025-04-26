import multer from "multer";
import path from "path";
import fs from "fs";
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let folder = "./public/uploads"; // Default folder

    // Check the request URL to determine where to save the image
    if (req.baseUrl.includes("/api/blog")) {
      folder = "./public/uploads/blogs"; // Store blogs images here
    } else if (req.baseUrl.includes("/api/category")) {
      folder = "./public/uploads/categories"; // Store categories images here
    }

    // Create folder if it does not exist
    fs.mkdirSync(folder, { recursive: true });

    cb(null, folder);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    // console.log("file", file);

    const ext = path.extname(file.originalname); // Get file extension
    cb(null, file.fieldname + "-" + uniqueSuffix + ext); // Keep extension
  },
});

export const upload = multer({ storage: storage });
