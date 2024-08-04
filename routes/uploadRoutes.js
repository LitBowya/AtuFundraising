import path from "path";
import express from "express";
import multer from "multer";
import logger from "../logger.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination(req, file, cb) {
    // logger.debug("Setting destination for uploaded file");
    cb(null, "uploads/");
  },
  filename(req, file, cb) {
    const filename = `${file.fieldname}-${Date.now()}${path.extname(
      file.originalname
    )}`;
    logger.debug(`Generated filename: ${filename}`);
    cb(null, filename);
  },
});

function fileFilter(req, file, cb) {
  logger.debug(`Filtering file: ${file.originalname}`);
  const filetypes = /jpe?g|png|webp/;
  const mimetypes = /image\/jpe?g|image\/png|image\/webp/;

  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = mimetypes.test(file.mimetype);

  if (extname && mimetype) {
    logger.debug("File type is valid");
    cb(null, true);
  } else {
    logger.error("Invalid file type");
    cb(new Error("Images only!"), false);
  }
}

// Single image upload middleware
export const uploadSingleImage = multer({ storage, fileFilter }).single(
  "profilePicture"
);

// Multiple images upload middleware
export const uploadMultipleImages = multer({ storage, fileFilter }).array(
  "images",
  10
);

// Route for single image upload
router.post("/single", (req, res) => {
  logger.debug("Single image upload route hit");
  uploadSingleImage(req, res, function (err) {
    if (err) {
      logger.error(`Single image upload error: ${err.message}`);
      return res.status(400).send({ message: err.message });
    }

    logger.debug(`Image uploaded successfully: ${req.file.path}`);
    res.status(200).send({
      message: "Image uploaded successfully",
      image: `/${req.file.path}`,
    });
  });
});

// Route for multiple images upload
router.post("/multiple", (req, res) => {
  logger.debug("Multiple images upload route hit");
  uploadMultipleImages(req, res, function (err) {
    if (err) {
      logger.error(`Multiple images upload error: ${err.message}`);
      return res.status(400).send({ message: err.message });
    }

    const paths = req.files.map((file) => `/${file.path}`);
    logger.debug(`Images uploaded successfully: ${paths.join(", ")}`);
    res.status(200).send({
      message: "Images uploaded successfully",
      images: paths,
    });
  });
});

export default router;
