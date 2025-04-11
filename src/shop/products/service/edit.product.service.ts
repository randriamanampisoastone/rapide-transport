import {HttpException, HttpStatus, Injectable} from "@nestjs/common";
import {ERROR_UPDATING_PRODUCT, PRODUCT_NOT_FOUND} from "../../../../constants/response.constant";
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

    async editProduct(id: string, productDto: any) {
        try {
            const product = await this.getProductById(id);
            const updatedProduct = await this.updateProductBase(product.id, productDto);

            await Promise.all([
                this.handleImageUpdates(product, productDto.images),
                this.handleCategoryUpdates(updatedProduct.id, productDto.categories),
                this.handleVariantUpdates(product.id, productDto.variants),
                this.handleIngredientUpdates(updatedProduct.id, productDto.ingredients),
                this.handleSauceUpdates(updatedProduct.id, productDto.sauces),
                this.handleExtrasUpdates(updatedProduct.id, productDto.extras),
                this.handleDrinksUpdates(updatedProduct.id, productDto.drinks)
            ]);

            return this.returnDataOnFlush(updatedProduct);
        } catch (error) {
            throw new HttpException({
                error: ERROR_UPDATING_PRODUCT,
            }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    private async getProductById(id: string) {
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

        return product;
    }

    private async updateProductBase(id: string, productDto: any) {
        const {images, categories, variants, ingredients, sauces, extras, drinks, ...productData} = productDto;
        return this.prismaService.product.update({
            where: {id},
            data: productData
        });
    }

    private async handleImageUpdates(product: any, newImages: any[]) {
        if (!newImages?.length) return;

        const existingImages = product.images;
        const nonMainImages = existingImages.filter(img => !img.isMain);

        if (nonMainImages.length) {
            await Promise.all([
                ...nonMainImages.map(img => this.uploadAwsService.deleteFile(img.url)),
                this.prismaService.image.deleteMany({
                    where: {id: {in: nonMainImages.map(img => img.id)}}
                })
            ]);
        }

        await Promise.all(
            newImages.map(image => this.handleImageUpload(image, product.id))
        );
    }

    private async handleCategoryUpdates(productId: string, categories: string[]) {
        if (!categories?.length) return;

        await this.prismaService.productCategory.deleteMany({
            where: {productId}
        });

        await this.prismaService.productCategory.createMany({
            data: categories.map(categoryId => ({
                productId,
                categoryId
            }))
        });
    }

    private async handleIngredientUpdates(productId: string, ingredients: string[]) {
        if (!ingredients?.length) return;

        await this.prismaService.productIngredient.deleteMany({
            where: {productId}
        });

        await this.prismaService.productIngredient.createMany({
            data: ingredients.map(ingredientId => ({
                productId,
                ingredientId
            }))
        });
    }

    private async handleSauceUpdates(productId: string, sauces: string[]) {
        if (!sauces?.length) return;

        await this.prismaService.productSauce.deleteMany({
            where: {productId}
        });

        await this.prismaService.productSauce.createMany({
            data: sauces.map(sauceId => ({
                productId,
                sauceId
            }))
        });
    }

    private async handleExtrasUpdates(productId: string, extras: string[]) {
        try {
            if (!extras?.length) return;

            await this.prismaService.productAddOn.deleteMany({
                where: {productId}
            });

            await this.prismaService.productAddOn.createMany({
                data: extras.map(addOnId => ({
                    productId,
                    addOnId
                }))
            });
        }catch(error){
            console.log("error ", error);
        }
    }

    private async handleDrinksUpdates(productId: string, drinks: string[]) {
        if (!drinks?.length) return;

        await this.prismaService.productDrink.deleteMany({
            where: {productId}
        });

        await this.prismaService.productDrink.createMany({
            data: drinks.map(drinkId => ({
                productId,
                drinkId
            }))
        });
    }

    private async handleVariantUpdates(productId: string, variants: any[]) {
        if (!variants?.length) return;

        await this.prismaService.productVariant.deleteMany({
            where: {productId}
        });

        await this.prismaService.productVariant.createMany({
            data: variants.map(variant => ({
                productId,
                color: variant.color,
                size: variant.size,
                stock: variant.stock
            }))
        });
    }
}