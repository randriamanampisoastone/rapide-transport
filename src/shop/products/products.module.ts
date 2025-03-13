import {Module} from '@nestjs/common';
import {ProductsController} from "./products.controller";
import {AddProductService} from "./add.product.service";
import {UploadAwsService} from "../Common/upload-aws/upload-aws.service";
import {EditProductService} from "./edit.product.service";

@Module({
    controllers: [ProductsController],
    providers: [AddProductService, EditProductService, UploadAwsService],
})
export class ProductsModule {}
