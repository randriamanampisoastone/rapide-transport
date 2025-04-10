import {Module} from '@nestjs/common';
import {ProductsController} from "./products.controller";
import {AddProductService} from "./service/add.product.service";
import {UploadAwsService} from "../Common/upload-aws/upload-aws.service";
import {EditProductService} from "./service/edit.product.service";
import {ProductsService} from "./products.service";
import {SearchProductService} from "./service/search.product.service";
import {FavoriteService} from "./service/favorites/favorites.service";
import {ReviewService} from "./service/reviews/review.service";
import {VariantService} from "./service/variants/variant.service";
import {DiscountService} from "./service/discount/discount.service";
import {DiscountUtils} from "../Common/utils/discount";
import {Utils} from "../Common/utils/utils";
import {IngredientsController} from "./ingredients.controller";
import {IngredientsService} from "./service/ingredients/ingredients.service";
import {SaucesService} from "./service/sauces/sauces.service";
import {SaucesController} from "./sauces.controller";
import {AddOnsController} from './add.ons.controller';

@Module({
    controllers: [
        ProductsController,
        IngredientsController,
        SaucesController,
        AddOnsController
    ],
    providers: [
        AddProductService,
        EditProductService,
        ProductsService,
        UploadAwsService,
        SearchProductService,
        FavoriteService,
        ReviewService,
        VariantService,
        DiscountService,
        DiscountUtils,
        Utils,
        IngredientsService,
        SaucesService
    ],
    exports: [SearchProductService, ProductsService]
})
export class ProductsModule {
}
