import {HttpStatus, Injectable} from "@nestjs/common";
import {UploadAwsService} from "../Common/upload-aws/upload-aws.service";
import {PrismaService} from "../../prisma/prisma.service";
import {NOT_OWNER_OF_THE_PRODUCT, SAME_PRODUCT_ON_A_CUSTOMER} from "../../../constants/response.constant";
import {Product} from "@prisma/client";

@Injectable()
export class ProductsService {

    constructor(
        protected readonly uploadAwsService: UploadAwsService,
        protected readonly prismaService: PrismaService
    ) {
    }

    protected async handleImageUpload(image: any, productId: string) {
        const imageUrl = await this.uploadAwsService.uploadFile(image.file, 'product');
        return this.prismaService.image.create({
            data: {
                url: imageUrl,
                isMain: image.isMain ?? false,
                alt: image.alt ?? `product image ${productId}`,
                productId
            }
        });
    }

    protected async attachCategoriesToProduct(product: any, categoryId: string) {
        return this.prismaService.productCategory.create({
            data: {
                productId: product.id,
                categoryId: categoryId
            }
        });
    }

    protected createVariantProduct(id: any, variant: any) {
        return this.prismaService.productVariant.create({
            data: {
                productId: id,
                color: variant.color,
                size: variant.size,
                stock: variant.stock
            }
        });
    }

    protected async checkProductExist(productData: any, userConnected: string) {
        const existingProduct = await this.prismaService.product.findFirst({
            where: {
                name: {
                    equals: productData.name.trim().toLowerCase(),
                    mode: 'insensitive'
                },
                sellerId: userConnected,
            }
        });

        if (existingProduct) {
            return {
                statusCode: HttpStatus.CONFLICT,
                message: SAME_PRODUCT_ON_A_CUSTOMER,
                error: 'Conflict',
                productId: existingProduct.id
            };
        }
    }

    protected async returnDataOnFlush(product: Product){
        const  productWithRelations = await this.prismaService.product.findUnique({
            where: {id: product.id},
            include: {
                images: true,
                categories: {
                    include: {
                        category: true
                    }
                },
                variants: true,
            }
        });

        // Transform the response
        return {
            ...productWithRelations,
            price: Number(productWithRelations.price.toString()),
            categories: productWithRelations.categories.map(c => c.category)
        };
    }

    public async deleteImageFromProduct(imageId: string, user: string) {
        // Search file then delete it from AWS
        const image = await this.prismaService.image.findUnique({
            where: { id: imageId },
            include: {
                product: true
            }
        });

        if(user !== image.product.sellerId){
            return {
                statusCode: HttpStatus.FORBIDDEN,
                message: NOT_OWNER_OF_THE_PRODUCT,
                error: 'Forbidden',
            }
        }

        await this.uploadAwsService.deleteFile(image.url);

        await this.prismaService.image.delete({
            where: {
                id: imageId
            }
        });
        return { success: true }
    }
}