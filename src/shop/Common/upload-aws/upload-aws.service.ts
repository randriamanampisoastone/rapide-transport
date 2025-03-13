import { Injectable } from '@nestjs/common'
import * as AWS from 'aws-sdk'
import { ConfigService } from '@nestjs/config'
import { PrismaService } from '../../../prisma/prisma.service'


@Injectable()
export class UploadAwsService {
   private readonly s3: AWS.S3

   constructor(
      private readonly prisma: PrismaService,
      private readonly configService: ConfigService,
   ) {
      this.s3 = new AWS.S3({
         accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'),
         secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY'),
         region: this.configService.get('AWS_REGION'),
      })
   }

   async uploadFile(file: Express.Multer.File) {
      const fileName = `rapid-${file.originalname}-${Date.now()}`

      const params = {
         Bucket: this.configService.get('AWS_S3_BUCKET_NAME'),
         Key: fileName,
         Body: file.buffer,
         ContentType: file.mimetype,
         // ACL: 'public-read',
      }

      const uploadResult = await this.s3.upload(params).promise()
      return uploadResult.Location;
   }

   async deleteFile(fileUrl: string) {
      try{
      // Extract the key from the URL
      // // URL format is typically: https://s3.region.amazonaws.com/bucket-name/key
      const urlParts = fileUrl.split('/');
      let key = '';

         // Handle different S3 URL formats
         if (fileUrl.includes('amazonaws.com')) {
            // Get everything after the bucket name in the URL path
            const bucketName = this.configService.get('AWS_S3_BUCKET_NAME');
            const bucketIndex = urlParts.findIndex(part => part.includes(bucketName));

            if (bucketIndex !== -1) {
               key = urlParts.slice(bucketIndex + 1).join('/');
            } else {
               // Alternative format: look for the key after the domain
               const domainIndex = urlParts.findIndex(part => part.includes('amazonaws.com'));
               key = urlParts.slice(domainIndex + 1).join('/');
            }
         }

         if (!key) {
            throw new Error('Could not extract file key from URL');
         }

         const params = {
            Bucket: this.configService.get('AWS_S3_BUCKET_NAME'),
            Key: key
         };

         await this.s3.deleteObject(params).promise();
         return true;
      } catch (error) {
         console.error('Error deleting file from S3:', error);
         throw error;
      }

   }


}
