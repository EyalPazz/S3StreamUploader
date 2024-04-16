import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import axios from "axios";
import { Readable } from "readable-stream";

// Initialize the S3 client
const s3Client = new S3Client({ region: "us-east-1" }); // Use your appropriate region

// Function to stream data from a URL and upload it to S3
async function uploadFileFromUrlToS3(
  fileUrl: string,
  bucketName: string,
  key: string,
) {
  try {
    const response = await axios({
      method: "get",
      url: fileUrl,
      responseType: "stream",
    });

    const stream = response.data as Readable;

    const uploader = new Upload({
      client: s3Client,
      params: {
        Bucket: bucketName,
        Key: key,
        Body: stream,
      },
      // You can adjust these options depending on the size of the uploads
      partSize: 5 * 1024 * 1024, // 5 MB per part
      queueSize: 4, // Max of 4 parts uploading in parallel
    });

    uploader.on("httpUploadProgress", (progress) => {
      console.log(
        `Upload progress: ${progress.loaded} of ${progress.total} bytes`,
      );
    });

    await uploader.done();
    console.log("File uploaded successfully");
  } catch (error) {
    console.error("Error uploading file:", error);
  }
}

// Example usage
const fileUrl = "";
const bucketName = process.env.BUCKET_NAME as string;
const key = "myFile";
const s3Url = `https://${bucketName}.s3.${s3Client.config.region}.amazonaws.com/${key}`;

uploadFileFromUrlToS3(fileUrl, bucketName, key);
console.log(s3Url);
