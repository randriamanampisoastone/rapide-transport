import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { UpdateTransactionDto } from "./dto/update-transaction.dto";

@Injectable()
export class TransactionService {
    constructor(private readonly prismaService: PrismaService) {}

    async update(paymentTransactionId: string, updateTransactionDto: UpdateTransactionDto) {
        try {
            return await this.prismaService.paymentTransaction.update({
                where: {
                    paymentTransactionId
                },
                data: updateTransactionDto
            })
        } catch (error) {
            throw error
        }
    }
}