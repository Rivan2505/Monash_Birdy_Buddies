# AWS Learner Lab Setup for S3 Upload

## Overview
This application now supports uploading bird media files directly to your S3 bucket using AWS Learner Lab credentials.

## Configuration Steps

### 1. Get Your AWS Learner Lab Credentials
1. Log into your AWS Learner Lab
2. Click "Start Lab" to start your lab session
3. Click "AWS Details" to view your credentials
4. Copy the following values:
   - AWS Access Key ID
   - AWS Secret Access Key  
   - AWS Session Token

### 2. Update Configuration File
Open `src/config.json` and replace the placeholder values:

```json
{
    "region": "us-east-1",
    "userPoolId": "us-east-1_fG5O30xiK",
    "clientId": "etm2rd0v7bq5261ncblnc9f92",
    "bucketName": "YOUR_ACTUAL_S3_BUCKET_NAME",
    "aws": {
        "accessKeyId": "YOUR_ACTUAL_ACCESS_KEY_ID",
        "secretAccessKey": "YOUR_ACTUAL_SECRET_ACCESS_KEY",
        "sessionToken": "YOUR_ACTUAL_SESSION_TOKEN"
    }
}
```

### 3. Create S3 Bucket
1. In AWS Console, go to S3 service
2. Create a new bucket with a unique name
3. Enable public access if needed for your use case
4. Update the `bucketName` in config.json

### 4. Set CORS Policy (if needed)
If you encounter CORS errors, add this CORS policy to your S3 bucket:

```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
        "AllowedOrigins": ["*"],
        "ExposeHeaders": []
    }
]
```

## File Upload Structure
Files will be uploaded to your S3 bucket with this structure:
```
your-s3-bucket/
└── upload-files/
    └── {cognito-user-sub}/
        ├── filename1_2024-01-01T10-30-00-000Z.jpg
        ├── filename2_2024-01-01T10-31-00-000Z.mp3
        └── filename3_2024-01-01T10-32-00-000Z.mp4
```

## Important Notes
- AWS Learner Lab credentials are temporary and expire when your lab session ends
- You'll need to update the credentials in config.json each time you start a new lab session
- Keep your credentials secure and never commit them to version control
- Consider using environment variables for production deployments

## Troubleshooting
- **Access Denied**: Check your AWS credentials and S3 bucket permissions
- **CORS Errors**: Add the CORS policy to your S3 bucket
- **Bucket Not Found**: Verify the bucket name in config.json matches your actual bucket
- **Credentials Expired**: Get fresh credentials from AWS Learner Lab 