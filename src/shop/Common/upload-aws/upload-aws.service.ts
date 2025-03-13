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


}
