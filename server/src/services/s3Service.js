const fs = require('fs');
const path = require('path');
const { PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { s3Client, bucketName, isS3Enabled } = require('../config/s3');

/**
 * Upload file to S3 or retain local path
 */
const uploadFile = async (file, folder = 'resumes') => {
  if (isS3Enabled() && file) {
    try {
      const fileContent = fs.readFileSync(file.path);
      const key = `${folder}/${Date.now()}-${path.basename(file.originalname)}`;

      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: fileContent,
        ContentType: file.mimetype,
      });

      await s3Client.send(command);

      // Clean up local temp file
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }

      const s3Url = `https://${bucketName}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`;
      return {
        url: s3Url,
        storageType: 's3',
        key,
      };
    } catch (err) {
      console.error('AWS S3 upload error, falling back to local storage:', err.message);
    }
  }

  // Fallback: Local storage URL
  const relativePath = `/uploads/${folder}/${file.filename}`;
  return {
    url: relativePath,
    storageType: 'local',
    key: file.filename,
  };
};

/**
 * Delete file from S3 or local disk
 */
const deleteFile = async (fileUrl, storageType, key) => {
  try {
    if (storageType === 's3' && isS3Enabled() && key) {
      await s3Client.send(new DeleteObjectCommand({
        Bucket: bucketName,
        Key: key,
      }));
    } else if (fileUrl && fileUrl.startsWith('/uploads/')) {
      const localPath = path.join(__dirname, '../../', fileUrl);
      if (fs.existsSync(localPath)) {
        fs.unlinkSync(localPath);
      }
    }
  } catch (err) {
    console.error('Error deleting file:', err.message);
  }
};

module.exports = {
  uploadFile,
  deleteFile,
};
