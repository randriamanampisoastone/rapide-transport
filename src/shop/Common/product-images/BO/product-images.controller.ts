import {
   Controller,
   Post,
   UseInterceptors,
   UploadedFile,
   UploadedFiles,
   Param,
   UseGuards,
   Patch,
   Body
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
// import { RolesGuard } from '../auth/guards/roles.guard';
// import { Roles } from '../auth/decorators/roles.decorator';
import { ApiTags, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { ProductImagesService } from '../product-images.service'

@ApiTags('product-images')
@Controller('product-images')
export class ProductImagesController {
   constructor(private readonly productImagesService: ProductImagesService) {}

   @Post(':productId')
   // @UseGuards(JwtAuthGuard, RolesGuard)
   // @Roles('SELLER', 'ADMIN')
   @UseInterceptors(FileInterceptor('image'))
   @ApiConsumes('multipart/form-data')
   @ApiBody({
      schema: {
         type: 'object',
         properties: {
            image: {
               type: 'string',
               format: 'binary',
            },
         },
      },
   })
   uploadImage(
      @UploadedFile() file: Express.Multer.File,
      @Param('productId') productId: string,
   ) {
      return this.productImagesService.uploadImage(file, productId);
   }

   @Patch(':imageId/set-main')
   // @UseGuards(JwtAuthGuard, RolesGuard)
   // @Roles('SELLER', 'ADMIN')
   setMainImage(
      @Param('imageId') imageId: string,
      @Body('productId') productId: string,
   ) {
      return this.productImagesService.setMainImage(imageId, productId);
   }
}