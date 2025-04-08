import {PrismaService} from "../../prisma/prisma.service";
import {CreateAuditLogDto} from "./audit.dto";

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
           return null;
        }
        
    }
}