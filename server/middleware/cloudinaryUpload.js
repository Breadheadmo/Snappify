const cloudinary = require('../config/cloudinary');
const fs = require('fs');

async function uploadToCloudinary(localPath, publicId) {
  try {
    const result = await cloudinary.uploader.upload(localPath, {
      public_id: publicId,
      folder: 'products',
      resource_type: 'image',
    });
    // Remove local file after upload
    fs.unlinkSync(localPath);
    return result.secure_url;
  } catch (error) {
    throw error;
  }
}

module.exports = uploadToCloudinary;
