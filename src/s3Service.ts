// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import config from "./config.json";

// Create S3 client with AWS Learner Lab credentials
export const createS3Client = () => {
  return new S3Client({
    region: config.region,
    credentials: {
      accessKeyId: config.aws.accessKeyId,
      secretAccessKey: config.aws.secretAccessKey,
      sessionToken: config.aws.sessionToken,
    },
  });
};

// Function to upload a file to S3
export const uploadFileToS3 = async (file: File, userSub: string): Promise<string> => {
  const fileExtension = file.name.split('.').pop();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const fileName = `${file.name.split('.')[0]}_${userSub}_${timestamp}.${fileExtension}`;
  const key = `upload-files/${fileName}`;

  // Convert File to ArrayBuffer to avoid readableStream.getReader() error
  const fileBuffer = await file.arrayBuffer();

  const uploadParams = {
    Bucket: config.bucketName,
    Key: key,
    Body: fileBuffer,
    ContentType: file.type,
    Metadata: {
      'original-name': file.name,
      'upload-date': new Date().toISOString(),
      'user-sub': userSub
    }
  };

  try {
    const s3Client = createS3Client();
    const command = new PutObjectCommand(uploadParams);
    const response = await s3Client.send(command);
    console.log('File uploaded successfully:', response);
    return key; // Return the S3 key for the uploaded file
  } catch (error) {
    console.error('Error uploading file to S3:', error);
    throw error;
  }
};

// Function to upload multiple files
export const uploadMultipleFilesToS3 = async (
  files: File[], 
  userSub: string,
  onProgress?: (progress: number) => void
): Promise<string[]> => {
  const uploadPromises = files.map(async (file, index) => {
    try {
      const key = await uploadFileToS3(file, userSub);
      if (onProgress) {
        const progress = Math.round(((index + 1) / files.length) * 100);
        onProgress(progress);
      }
      return key;
    } catch (error) {
      console.error(`Failed to upload ${file.name}:`, error);
      throw error;
    }
  });

  return Promise.all(uploadPromises);
}; 