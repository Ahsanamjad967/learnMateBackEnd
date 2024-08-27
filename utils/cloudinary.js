const cloudinary = require("cloudinary").v2;
const ApiError = require("./ApiError");
// Configuration
cloudinary.config({
  cloud_name: "di9sthase",
  api_key: "763814351785622",
  api_secret: process.env.API_SECRET,
});

let uploadOnCloudinary = async (localFilePath) => {
  const uploadResult = await cloudinary.uploader
    .upload(localFilePath, {
      resource_type: "auto",
    })
    .catch((error) => {
      throw new ApiError(500, "Something went wrong while uploading file ");
    });

  return uploadResult?.secure_url;
};

module.exports = uploadOnCloudinary;
