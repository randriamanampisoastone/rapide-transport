import {ProductsService} from "../products.service";
import {UploadAwsService} from "../../Common/upload-aws/upload-aws.service";
import {PrismaService} from "../../../prisma/prisma.service";
import {ReviewService} from "./reviews/review.service";
import {Injectable} from "@nestjs/common";
import {FavoriteService} from "./favorites/favorites.service";
import {Profile} from "@prisma/client";
import {UserRole} from "../../../../enums/profile.enum";

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
        user?: string | null,
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
        let connectedUser: any = null;

        if (user) {
            try{
                connectedUser = await this.getConnectedUser(user);
                console.log('user ', user);
                console.log('connectedUser ', connectedUser);
            }catch (error){
                console.error('Error fetching connected user:', error);
            }
        }

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

        if (connectedUser !== null && connectedUser.role === UserRole.SELLER) {
            where.sellerId = user;
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
                createdAt: true,
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

            let dataToReturn = {
                ...product,
                price: Number(product.price.toString()),
                categories: product.categories.map(c => c.category),
                discounts: product.discounts.map(d => ({
                    ...d.discount,
                    value: Number(d.discount.value.toString())
                })),
                reviewsCount: await this.reviewService.getProductReviewCount(product.id),
            }

            if (connectedUser !== null && connectedUser.role === UserRole.CLIENT) {
                const rating = await this.reviewService.getAverageRating(product.id);
                const favorite = user ? await this.favoriteService.isFavorite(user, product.id) : false;

                return {
                    ...dataToReturn,
                    rating,
                    isFavorite: favorite,
                };
            }

            return dataToReturn;
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

    async getInfoProduct(id: string, user?: string) {
        let connectedUser: any = null;
        let transformedProduct: any = null;

        if (user) {
            connectedUser = await this.getConnectedUser(user);
        }

        const product = await this.prismaService.product.findUnique({
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

        if (!product) {
            return null;
        }

        let dataToReturn = {
            ...product,
            reviewsCount: await this.reviewService.getProductReviewCount(product.id),
            price: Number(product.price.toString()),
            categories: product.categories.map(c => c.category),
            discounts: product.discounts.map(d => ({
                ...d.discount,
                value: Number(d.discount.value.toString())
            }))
        }

        transformedProduct = dataToReturn;

        if (connectedUser !== null && connectedUser.role === UserRole.CLIENT) {
            transformedProduct = {
                ...dataToReturn,
                rating: await this.reviewService.getAverageRating(product.id),
                isFavorite: user ? await this.favoriteService.isFavorite(user, product.id) : false
            }
        }

        return transformedProduct;
    }

    private getConnectedUser(user: string) {
        return this.prismaService.profile.findUnique({
            where: {
                sub: user
            }
        });
    }
}