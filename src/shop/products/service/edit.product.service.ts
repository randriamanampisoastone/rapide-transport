import {HttpException, HttpStatus, Injectable} from "@nestjs/common";
import {ERROR_CREATING_PRODUCT, PRODUCT_NOT_FOUND} from "../../../../constants/response.constant";
import {UploadAwsService} from "../../Common/upload-aws/upload-aws.service";
import {PrismaService} from "../../../prisma/prisma.service";
import {ProductsService} from "../products.service";

@Injectable()
export class EditProductService extends ProductsService {

    constructor(
        uploadAwsService: UploadAwsService,
        prismaService: PrismaService
    ) {
        super(uploadAwsService, prismaService);
    }

    async editProduct(id: string, createProductDto: any) {
        try {
            const {images, categories, variants, ...productData} = createProductDto;

            // Check the product by id
            const product = await this.prismaService.product.findUnique({
                where: {id}
            });
            if (!product) {
                return {
                    statusCode: HttpStatus.NOT_FOUND,
                    message: PRODUCT_NOT_FOUND,
                    error: 'Not Found',
                };
            }

            // Update the product record first
            const updatedProduct = await this.prismaService.product.update({
                where: { id: product.id },
                data: productData
            });

            // Process images if exist
            if (images && images.length > 0) {
                const imagePromises = images.map(image =>
                    this.handleImageUpload(image, updatedProduct.id)
                );
                await Promise.all(imagePromises);
            }

            // Handle categories if present
            if (categories && categories.length > 0) {
                // First delete existing category relationships
                await this.prismaService.productCategory.deleteMany({
                    where: { productId : updatedProduct.id }
                });

                // Then create new category relationships
                const categoryPromises = categories.map(categoryId =>
                    this.attachCategoriesToProduct(updatedProduct, categoryId)
                );
                await Promise.all(categoryPromises);
            }

            // Process variants if they exist
            if(variants && variants.length > 0){
                const variantPromises = variants.map(async variant =>
                    await this.createVariantProduct(product.id, variant)
                );
                await Promise.all(variantPromises);
            }

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