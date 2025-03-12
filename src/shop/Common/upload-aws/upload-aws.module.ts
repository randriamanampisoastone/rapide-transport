import { Module } from '@nestjs/common';
import {UploadAwsService} from "./upload-aws.service";

@Module({
    imports: [],
    providers: [UploadAwsService],
    exports: [UploadAwsService],
})
export class UploadAwsModule { }