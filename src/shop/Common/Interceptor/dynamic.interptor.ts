import { FileFieldsInterceptor } from "@nestjs/platform-express";

export const createDynamicFileInterceptor = (maxImages: number = 10) => {
    const fileFields = [];

    for (let i = 0; i < maxImages; i++) {
        fileFields.push({name: `images[${i}]file`, maxCount: 1});
    }

    return FileFieldsInterceptor(fileFields);
}