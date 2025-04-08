import {PrismaService} from "../../prisma/prisma.service";
import {CreateAuditLogDto} from "./audit.dto";
import {HttpException, HttpStatus} from "@nestjs/common";
import {ERROR_ADDING_AUDIT} from "../../../constants/response.constant";

export class AuditService {
    constructor(
        private readonly prismaService: PrismaService,
    ) {}

    async log(auditDto: CreateAuditLogDto) {
        try {
            await this.prismaService.auditLog.create({
                data: auditDto,
            });
        } catch (error) {
            console.log('Error creating audit log:', error);
            throw new HttpException({
                error: ERROR_ADDING_AUDIT + error,
            }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
        
    }
}