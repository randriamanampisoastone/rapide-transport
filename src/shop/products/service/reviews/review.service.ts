import {Injectable} from "@nestjs/common";
import {PrismaService} from "../../../../prisma/prisma.service";
import {CreateReviewDto} from "../../dto/create-review.dto";

@Injectable()
export class ReviewService {
    constructor(
        private readonly prismaService: PrismaService,
    ) {
    }

    async createReview(userId: string, reviewDto: CreateReviewDto) {
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

    async deleteReview(reviewId: string) {
        return this.prismaService.review.delete({
            where: {
                id: reviewId,
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

}