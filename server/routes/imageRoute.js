const express = require("express");
const router = express.Router();
const cloudinary = require("../config/cloudinary");
const upload = require("../middleware/multer");

router.post("/upload", upload.single("image"), async (req, res) => {
  try {
    const result = await cloudinary.uploader.upload(req.file.path);
    res.json({
      msg: "image uploaded",
      result,
    });
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;