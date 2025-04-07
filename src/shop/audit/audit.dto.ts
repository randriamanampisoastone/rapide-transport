type AuditLogDto = {
    entityType: string;
    entityId: any;
    action: string;
    oldValue?: string;
    newValue?: string;
    performedBy: string;
}


export type CreateAuditLogDto = Required<AuditLogDto>;