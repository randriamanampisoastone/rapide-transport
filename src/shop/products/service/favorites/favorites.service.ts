import {PrismaService} from "../../../../prisma/prisma.service";
import {HttpStatus, Injectable} from "@nestjs/common";
import {ALREADY_EXIST, NOT_OWNER_OF_THE_PRODUCT} from "../../../../../constants/response.constant";

@Injectable()
export class FavoriteService {
    constructor(
        private readonly prismaService: PrismaService,
    ) {
    }

    async addToFavorites(userId: string, productId: string) {
        const existingFavorite = await this.prismaService.favorite.findUnique({
            where: {
                userId_productId: {
                    userId: userId,
                    productId: productId,
                },
            },
        });

        if (existingFavorite) {
            return {
                statusCode: HttpStatus.CONFLICT,
                message: ALREADY_EXIST,
                error: 'Conflict',
            }
        }

        return this.prismaService.favorite.create({
            data: {
                userId: userId,
                productId: productId,
            },
        });
    }

    async removeFromFavorite(userId: string, productId: string) {
        return this.prismaService.favorite.delete({
            where: {
                userId_productId: {
                    userId: userId,
                    productId: productId,
                },
            },
        });
    }

    async isFavorite(userId: string, productId: string) {
        const favorite = await this.prismaService.favorite.findUnique({
            where: {
                userId_productId: {
                    userId: userId,
                    productId: productId
                }
            }
        });

        return (favorite !== null);
    }

    async getUserFavorites(userId: string) {
        return this.prismaService.favorite.findMany({
            where: {
                userId: userId,
            },
            include: {
                product: true,
            },
        });
    }
}