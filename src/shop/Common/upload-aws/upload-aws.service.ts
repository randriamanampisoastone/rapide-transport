import { Injectable } from '@nestjs/common'
import {
   S3Client,
   PutObjectCommand,
   DeleteObjectCommand
} from '@aws-sdk/client-s3'
import { ConfigService } from '@nestjs/config'
import { PrismaService } from '../../../prisma/prisma.service'

@Injectable()
export class UploadAwsService {
   private readonly s3Client: S3Client

   constructor(
       private readonly prisma: PrismaService,
       private readonly configService: ConfigService,
   ) {
      this.s3Client = new S3Client({
         region: this.configService.get('AWS_REGION'),
         credentials: {
            accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'),
            secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY'),
         }
      })
   }

   async uploadFile(file: Express.Multer.File, folder: string = 'general') {
      const sanitizedFolder = folder.replace(/[^\w\s-]/g, '').replace(/[-\s]+/g, '-').toLowerCase()

      const fileName = `rapid-${Date.now()}-${file.originalname}`;
      const fullPath = `${sanitizedFolder}/${fileName}`;

      const params = {
         Bucket: this.configService.get('AWS_S3_BUCKET_NAME'),
         Key: fullPath,
         Body: file.buffer,
         ContentType: 'image/jpeg, image/jpg, image/png, image/svg, image/tiff, image/bmp',
         // ACL:ObjectCannedACL.public_read_write
      }

      try {
         const command = new PutObjectCommand(params)
         await this.s3Client.send(command)

         // Construct URL manually since SDK v3 doesn't return upload location
         return `https://s3.${this.configService.get('AWS_REGION')}.amazonaws.com/${params.Bucket}/${fullPath}`
      } catch (error) {
         console.error('Error uploading file to S3:', error)
         throw error
      }
   }

   async deleteFile(fileUrl: string) {
      try {
         // Extract the key from the URL
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

         const command = new DeleteObjectCommand(params)
         await this.s3Client.send(command)
         return true
      } catch (error) {
         console.error('Error deleting file from S3:', error);
         throw error;
      }
   }
}