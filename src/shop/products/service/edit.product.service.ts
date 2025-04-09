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
            const {images, categories, variants, ingredients, ...productData} = createProductDto;

            // Check the product by id
            const product = await this.prismaService.product.findUnique({
                where: {id},
                include: {
                    images: true,
                    categories: true,
                    variants: true,
                    ingredients: true
                }
            });

            if (!product) {
                throw new HttpException({
                    message: PRODUCT_NOT_FOUND,
                    error: 'Not Found',
                }, HttpStatus.NOT_FOUND);
            }

            // Update the product record first
            const updatedProduct = await this.prismaService.product.update({
                where: { id: product.id },
                data: productData
            });

            // Process images if exist
            if (images && images.length > 0) {
                // Delete existing non-main images if requested
                const existingImages = product.images;
                const imagesToDelete = existingImages.filter(img => !img.isMain);

                if (imagesToDelete.length > 0) {
                    // Delete files from AWS
                    await Promise.all(
                        imagesToDelete.map(img => this.uploadAwsService.deleteFile(img.url))
                    );

                    // Delete image records
                    await this.prismaService.image.deleteMany({
                        where: {
                            id: {
                                in: imagesToDelete.map(img => img.id)
                            }
                        }
                    });
                }

                // Upload new images
                const imagePromises = images.map(image =>
                    this.handleImageUpload(image, updatedProduct.id)
                );
                await Promise.all(imagePromises);
            }

            // Handle categories if present
            if (categories && categories.length > 0) {
                await this.prismaService.productCategory.deleteMany({
                    where: { productId: updatedProduct.id }
                });

                await this.prismaService.productCategory.createMany({
                    data: categories.map(categoryId => ({
                        productId: updatedProduct.id,
                        categoryId
                    }))
                });
            }

            // Handle ingredients if present
            if(ingredients && ingredients.length > 0){
                await this.prismaService.productIngredient.deleteMany({
                    where: { productId: updatedProduct.id }
                });

                await this.prismaService.productIngredient.createMany({
                    data: ingredients.map(ingredientId => ({
                        productId: updatedProduct.id,
                        ingredientId
                    }))
                });
            }

            // Process variants if they exist
            if (variants && variants.length > 0) {
                await this.prismaService.productVariant.deleteMany({
                    where: { productId: product.id }
                });

                await this.prismaService.productVariant.createMany({
                    data: variants.map(variant => ({
                        productId: product.id,
                        color: variant.color,
                        size: variant.size,
                        stock: variant.stock
                    }))
                });
            }

            // Return the updated product with relations
            return this.returnDataOnFlush(updatedProduct);
        } catch (error) {
            if (error instanceof HttpException) throw error;

            throw new HttpException({
                error: ERROR_CREATING_PRODUCT,
            }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


}