const { S3Client } = require('@aws-sdk/client-s3');

let s3Client = null;

if (process.env.STORAGE_TYPE === 's3' && process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
  s3Client = new S3Client({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    }
  });
  console.log('☁️ AWS S3 client initialized for file storage');
} else {
  console.log('💾 File storage configured to Local Disk storage (uploads/)');
}

module.exports = {
  s3Client,
  bucketName: process.env.AWS_S3_BUCKET_NAME || 'ai-job-portal-bucket',
  isS3Enabled: () => Boolean(s3Client && process.env.AWS_S3_BUCKET_NAME)
};
