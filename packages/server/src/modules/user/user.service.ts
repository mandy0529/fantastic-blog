import { Injectable } from '@nestjs/common';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
@Injectable()
export class UserService {
  private readonly s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });

  // upload file to s3
  async uploadFileToS3(key: string, body: Buffer, mimetype: string) {
    try {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: process.env.AWS_BUCKET,
          Key: `${Date.now()}-${key}`,
          Body: body,
          ContentType: mimetype,
        }),
      );
      return { success: true };
    } catch (error) {
      console.error('Error uploading file:s3', error);
      return { success: false, error };
    }
  }
  // upload files
  async uploadFiles(files) {
    const uploadArray = [];

    for (const field of Object.keys(files)) {
      for (const file of files[field]) {
        const { originalname, buffer, mimetype } = file as Express.Multer.File;
        const fileName = originalname;

        const uploadPromise = this.uploadFileToS3(fileName, buffer, mimetype);
        uploadArray.push(uploadPromise);
      }
    }

    const uploadResults = await Promise.all(uploadArray);
    return uploadResults;
  }
}
