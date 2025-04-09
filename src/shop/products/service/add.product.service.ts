import {HttpException, HttpStatus, Injectable} from "@nestjs/common";
import {ERROR_CREATING_PRODUCT} from "../../../../constants/response.constant";
import {UploadAwsService} from "../../Common/upload-aws/upload-aws.service";
import {PrismaService} from "../../../prisma/prisma.service";
import {ProductsService} from "../products.service";
import {IngredientsService} from "./ingredients/ingredients.service";
import {SaucesService} from "./sauces/sauces.service";

@Injectable()
export class AddProductService extends ProductsService {

    constructor(
        uploadAwsService: UploadAwsService,
        prismaService: PrismaService,
        private readonly ingredientsService: IngredientsService,
        private readonly saucesService: SaucesService,
    ) {
        super(uploadAwsService, prismaService);
    }

    async createProduct(createProductDto: any, userConnected: string) {
        try {
            const {images, categories, variants, ingredients, sauces, ...productData} = createProductDto;

            // Check if the user already has a product with the same name
            await this.checkProductExist(productData, userConnected);

            // Create the product first
            const product = await this.prismaService.product.create({
                data: {
                    ...productData,
                    sellerId: userConnected,
                }
            });

            // Process images if they exist
            const imagePromises = images?.map(image =>
                this.handleImageUpload(image, product.id)
            ) ?? [];

            // Process variants if they exist
            const variantPromises = variants?.map(async variant => {
                await this.createVariantProduct(product.id, variant);
                }) ?? [];

            /// Process categories if they exist
            const categoryPromises = categories?.map(async categoryId => {
                await this.attachCategoriesToProduct(product, categoryId)
            }) ?? [];

            const ingredientPromises = ingredients?.map(async ingredientId => {
                await this.ingredientsService.attachIngredientsToProduct(product.id, ingredientId);
            }) ?? [];

            const  saucePromises = sauces?.map(async sauceId => {
                await this.saucesService.attachSaucesToProduct(product.id, sauceId);
            }) ?? [];

            // Wait for all async operations to complete
            await Promise.all([
                ...imagePromises,
                ...categoryPromises,
                ...variantPromises,
                ...ingredientPromises,
                ...saucePromises
            ]);

            // Return the complete product with relations
           return this.returnDataOnFlush(product);
        } catch (error) {
            console.error('Error creating product:', error);
            throw new HttpException({
                error: ERROR_CREATING_PRODUCT,
            }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}