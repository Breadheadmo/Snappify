const cloudinary = require('../config/cloudinary');
const fs = require('fs');

async function uploadToCloudinary(localPath, publicId) {
  try {
    // Check if file exists before upload
    if (!fs.existsSync(localPath)) {
      throw new Error(`File not found: ${localPath}`);
    }

    const result = await cloudinary.uploader.upload(localPath, {
      public_id: publicId,
      folder: 'products',
      resource_type: 'image',
    });
    
    // Remove local file after successful upload
    try {
      fs.unlinkSync(localPath);
    } catch (cleanupError) {
      console.warn('Warning: Could not delete local file:', cleanupError.message);
    }
    
    return result.secure_url;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    
    // Clean up local file even if upload failed
    try {
      if (fs.existsSync(localPath)) {
        fs.unlinkSync(localPath);
      }
    } catch (cleanupError) {
      console.warn('Warning: Could not clean up failed upload file:', cleanupError.message);
    }
    
    throw error;
  }
}

module.exports = uploadToCloudinary;
