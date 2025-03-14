import {ProductsService} from "../products.service";
import {UploadAwsService} from "../../Common/upload-aws/upload-aws.service";
import {PrismaService} from "../../../prisma/prisma.service";

export class SearchProductService extends ProductsService {
    constructor(
        uploadAwsService: UploadAwsService,
        prismaService: PrismaService
    ) {
        super(uploadAwsService, prismaService);
    }

    async getProducts(
        productFor: string,
        page?: number,
        itemsPerPage?: number,
        name?: string,
        minPrice?: number,
        maxPrice?: number,
        categories?: string | string[],
        shop?: string
    ) {
        // Set default values
        const currentPage = page ? parseInt(page.toString()) : 1;
        const limit = itemsPerPage ? parseInt(itemsPerPage.toString()) : 10;
        const skip = (currentPage - 1) * limit;

        const where: any = {};

        // Add name filter if provided
        if (name) {
            where.name = {
                contains: name,
                mode: 'insensitive'
            };
        }

        // Add price filter if provided
        if (minPrice !== undefined || maxPrice !== undefined) {
            where.price = {};
            if (minPrice !== undefined && !isNaN(Number(minPrice))) {
                where.price.gte = Number(minPrice);
            }
            if (maxPrice !== undefined && !isNaN(Number(maxPrice))) {
                where.price.lte = Number(maxPrice);
            }
        }

        // find by categories
        if (categories) {
            const categoryIds = Array.isArray(categories) ? categories : [categories];
            where.categories = {
                some: {
                    categoryId: {
                        in: categoryIds
                    }
                }
            };
        }

        if (productFor) {
            where.categories = {
                ...where.categories,
                some: {
                    ...where.categories?.some,
                    category: {
                        for: productFor
                    }
                }
            };
        }

        // find by shop name
        if (shop) {
            // needed on web part, 'cauz the product shop is filter by owner
            // when connect to web, get the connectedUser info and get sub
            where.sellerId = shop;
        }

        // Get total count for pagination
        const totalCount = await this.prismaService.product.count({where});

        // Get products with pagination and filters

        const products = await this.prismaService.product.findMany({
            where,
            skip,
            take: limit,
            select: {
                id: true,
                name: true,
                price: true,
                inventory: true,
                images: {
                    select: {
                        id: true,
                        url: true,
                        isMain: true
                    }
                },
                categories: {
                    select: {
                        category: {
                            select: {
                                id: true,
                                name: true,
                                icon: true
                            }
                        }
                    }
                }
            }
        });

        // Transform products to include full category objects
        const transformedProducts = products.map(product => ({
            ...product,
            price: Number(product.price.toString()),
            categories: product.categories.map(c => c.category)
        }));

        return {
            data: transformedProducts,
            meta: {
                totalCount,
                page: currentPage,
                itemsPerPage: limit,
                pageCount: Math.ceil(totalCount / limit)
            }
        };
    }

    async getInfoProduct(id: string) {
        const products = await this.prismaService.product.findMany({
            where: {
                id: id
            },
            include: {
                images: true,
                categories: {
                    include: {
                        category: true
                    }
                }
            }
        });

        // Transform products to include full category objects
        return products.map(product => ({
            ...product,
            price: Number(product.price.toString()),
            categories: product.categories.map(c => c.category)
        }));
    }

}