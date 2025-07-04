import AWS from "aws-sdk";

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

export const uploadToS3 = async (buffer, filename, mimetype) => {
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: `certificates/${filename}`,
    Body: buffer,
    ContentType: mimetype,
    ACL: "public-read", // Optional: for public URL access
  };

  const uploadResult = await s3.upload(params).promise();
  return uploadResult.Location; // returns the file URL
};
