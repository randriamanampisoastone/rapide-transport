import {int} from "aws-sdk/clients/datapipeline";
import {FileFieldsInterceptor} from "@nestjs/platform-express";

export const createDynamicFileInterceptor = (maxImages: int = 10) => {
    const fileFields = [];

    for (let i = 0; i < maxImages; i++) {
        fileFields.push({name: `images[${i}]file`, maxCount: 1});
    }

    return FileFieldsInterceptor(fileFields);
}