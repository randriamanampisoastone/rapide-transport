import {PrismaService} from "../../../../prisma/prisma.service";
import {Injectable} from "@nestjs/common";

@Injectable()
export class FavoriteService {
    constructor(
        private readonly prismaService: PrismaService,
    ) {
    }

    async addToFavorites(userId: string, productId: string) {
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

        return !!favorite;
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