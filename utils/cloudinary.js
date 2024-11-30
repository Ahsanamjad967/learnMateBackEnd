const cloudinary = require("cloudinary").v2;
const { trusted } = require("mongoose");
const ApiError = require("./ApiError");
const fs = require("fs");

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
      fs.unlinkSync(localFilePath);
      throw new ApiError(500, "Something went wrong while uploading file ");
    });
  fs.unlinkSync(localFilePath);
  return uploadResult?.secure_url;
};

let deleteFromCloudinary = async (publicUrl) => {
  try {
    const urlParts = publicUrl.split("/");
    const publicIdWithExtension = urlParts[urlParts.length - 1];
    if(publicUrl.includes('raw')){
      return await cloudinary.uploader.destroy(publicIdWithExtension,{resource_type:"raw"});
    
    }
    else{
    const publicId = publicIdWithExtension.split(".")[0];
    const deletedAsset = await cloudinary.uploader.destroy(publicId,{resource_type:"image"});
    return deletedAsset;
    }
  } catch (error) {
    throw new ApiError(500,error.message)
  }

};

module.exports = {uploadOnCloudinary,deleteFromCloudinary};
