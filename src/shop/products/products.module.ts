import {Module} from '@nestjs/common';
import {ProductsController} from "./products.controller";
import {AddProductService} from "./service/add.product.service";
import {UploadAwsService} from "../Common/upload-aws/upload-aws.service";
import {EditProductService} from "./service/edit.product.service";
import {ProductsService} from "./products.service";
import {SearchProductService} from "./service/search.product.service";

@Module({
    controllers: [ProductsController],
    providers: [
        AddProductService,
        EditProductService,
        ProductsService,
        UploadAwsService,
        SearchProductService
    ],
})
export class ProductsModule {}
