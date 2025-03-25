import {ProductsService} from "../products.service";
import {UploadAwsService} from "../../Common/upload-aws/upload-aws.service";
import {PrismaService} from "../../../prisma/prisma.service";
import {ReviewService} from "./reviews/review.service";
import {Injectable} from "@nestjs/common";
import {FavoriteService} from "./favorites/favorites.service";

@Injectable()
export class SearchProductService extends ProductsService {
    constructor(
        uploadAwsService: UploadAwsService,
        prismaService: PrismaService,
        private readonly reviewService: ReviewService,
        private readonly favoriteService: FavoriteService
    ) {
        super(uploadAwsService, prismaService);
    }

    async getProducts(
        productFor: string,
        user: string,
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
                description: true,
                price: true,
                inventory: true,
                toWear: true,
                seller: {
                    select: {
                        sub: true,
                        firstName: true,
                        lastName: true,
                    }
                },
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
                },
                discounts: {
                    select: {
                        discount: {
                           select: {
                               type: true,
                               value: true
                           }
                        }
                    }
                },
            }
        });


        // Transform products and add ratings
        const transformedProducts = await Promise.all(products.map(async product => {
            const rating = await this.reviewService.getAverageRating(product.id);
            const favorite = user ? await this.favoriteService.isFavorite(user, product.id) : false;
            return {
                ...product,
                price: Number(product.price.toString()),
                isFavorite: favorite,
                categories: product.categories.map(c => c.category),
                rating
            };
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

    async getInfoProduct(id: string, user: string) {
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
                },
                variants: true,
                discounts: {
                    include: {
                        discount: true
                    }
                }
            }
        });

        // Transform products and await async operations
        const transformedProducts = await Promise.all(products.map(async product => ({
            ...product,
            rating: await this.reviewService.getAverageRating(product.id),
            isFavorite: user ? await this.favoriteService.isFavorite(user, product.id) : false,
            price: Number(product.price.toString()),
            categories: product.categories.map(c => c.category)
        })));

        return transformedProducts;
    }

}