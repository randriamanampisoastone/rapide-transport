import { Injectable } from '@nestjs/common'
import * as AWS from 'aws-sdk'
import { ConfigService } from '@nestjs/config'
import { PrismaService } from '../../../prisma/prisma.service'


@Injectable()
export class ProductImagesService {
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

   async uploadImage(file: Express.Multer.File, productId: string) {
      const fileName = `products/${productId}/${Date.now()}-${file.originalname}`

      const params = {
         Bucket: this.configService.get('AWS_S3_BUCKET_NAME'),
         Key: fileName,
         Body: file.buffer,
         ContentType: file.mimetype,
         ACL: 'public-read',
      }

      const uploadResult = await this.s3.upload(params).promise()
      // Create database record
      return this.prisma.image.create({
         data: {
            url: uploadResult.Location,
            productId,
            isMain: false, // Default to not main
         },
      })
   }

   async setMainImage(imageId: string, productId: string) {
      // First unset all main images for this product
      await this.prisma.image.updateMany({
         where: { productId },
         data: { isMain: false },
      });

      // Then set the selected image as main
      return this.prisma.image.update({
         where: { id: imageId },
         data: { isMain: true },
      });
   }
}
