import {HttpException, HttpStatus, Injectable} from "@nestjs/common";
import {PrismaService} from "../../../../prisma/prisma.service";
import {CreateReviewDto} from "../../dto/create-review.dto";
import {NOT_OWNER_OF_THE_PRODUCT} from "../../../../../constants/response.constant";

@Injectable()
export class ReviewService {
    constructor(
        private readonly prismaService: PrismaService,
    ) {
    }

    async createReview(userId: string, reviewDto: CreateReviewDto) {
        const userReview = this.prismaService.review.findFirst({
            where: {
                productId: reviewDto.productId,
                userId: userId
            }
        })

        if(userReview){
            throw new HttpException({
                error: NOT_OWNER_OF_THE_PRODUCT
            }, HttpStatus.BAD_REQUEST);
        }

        return this.prismaService.review.create({
            data: {
                productId: reviewDto.productId,
                rating: parseInt(reviewDto.rating),
                comment: reviewDto.comment,
                userId: userId
            }
        });
    }

    async updateReview(reviewId: string, rating: number, comment?: string) {
        return this.prismaService.review.update({
            where: {
                id: reviewId,
            },
            data: {
                rating,
                comment,
            },
        });
    }

    async deleteReview(userId: string, reviewId: string) {
        return this.prismaService.review.delete({
            where: {
                id: reviewId,
                userId: userId
            },
        });
    }

    async getUserReviewForProduct(userId: string, productId: string) {
        return this.prismaService.review.findFirst({
            where: {
                userId,
                productId,
            },
        });
    }

    async getProductReviews(productId: string) {
        return this.prismaService.review.findMany({
            where: {
                productId,
            },
            include: {
                user: true,
            },
        });
    }


    async getAverageRating(productId: string): Promise<number> {
        const reviews = await this.prismaService.review.findMany({
            where: {
                productId,
            },
            select: {
                rating: true,
            },
        });

        if (reviews.length === 0) {
            return 0;
        }

        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        return totalRating / reviews.length;
    }

}