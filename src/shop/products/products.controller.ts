import {
    Body,
    Controller,
    Param,
    Patch,
    Post,
    SetMetadata,
    UploadedFiles,
    UseGuards,
    UseInterceptors
} from "@nestjs/common";
import {AddProductService} from "./add.product.service";
import {CreateProductDto} from "./dto/create-product.dto";
import {ApiBody, ApiConsumes, ApiOperation} from "@nestjs/swagger";
import {UserRole} from "../../../enums/profile.enum";
import {RolesGuard} from "../../jwt/roles.guard";
import {GetUser} from "../../jwt/get.user.decorator";
import {createDynamicFileInterceptor} from "../Common/Interceptor/dynamic.interptor";
import {EditProductService} from "./edit.product.service";
import {UpdateProductDto} from "./dto/update-product.dto";


@Controller('products')
export class ProductsController {
    constructor(
        private readonly addProductService: AddProductService,
        private readonly editProductService: EditProductService
    ) {}

   private transformData(rawData: any, files: any) {
    // Reshape the form data with optional fields
    const data: any = {};

    // Check and assign each field only if it exists in rawData
    if (rawData.name !== undefined) data.name = rawData.name;
    if (rawData.description !== undefined) data.description = rawData.description;
    if (rawData.price !== undefined) data.price = Number(rawData.price);
    if (rawData.inventory !== undefined) data.inventory = Number(rawData.inventory);
    if (rawData.isClothes !== undefined) data.isClothes = rawData.isClothes === 'true';
    if (rawData.color !== undefined) data.color = rawData.color;
    if (rawData.size !== undefined) data.size = rawData.size;

    // Handle categories if present
    if (rawData.categories) {
        data.categories = Array.isArray(rawData.categories)
            ? rawData.categories
            : [rawData.categories];
    }

    // Process only the files that were actually sent
    const images = [];

    if (files && Object.keys(files).length > 0) {
        // Get all the file keys that were uploaded
        const fileKeys = Object.keys(files);

        for (const fileKey of fileKeys) {
            // Extract index from the key name (e.g., "images[0]file" -> "0")
            const match = fileKey.match(/images\[(\d+)\]file/);
            if (match) {
                const index = match[1];
                const isMainKey = `images[${index}]isMain`;
                const altKey = `images[${index}]alt`;

                images.push({
                    file: files[fileKey][0],
                    isMain: rawData[isMainKey] === 'true',
                    alt: rawData[altKey] || null
                });
            }
        }
    }

    // Only include images if there are any
    return images.length > 0 ? { ...data, images } : data;
}

    @SetMetadata('allowedRole', [UserRole.SELLER])
    @UseGuards(RolesGuard)
    @ApiOperation({summary: 'Create new product'})
    @Post()
    @ApiConsumes('multipart/form-data')
    @ApiBody({type: CreateProductDto})
    @UseInterceptors(createDynamicFileInterceptor(10))
    async createProduct(
        @Body() rawData: any,
        @UploadedFiles() files: any,
        @GetUser('sub') user: string
    ){
        const transformedData = this.transformData(rawData, files);
        return await this.addProductService.createProduct(transformedData, user);
    }

    @SetMetadata('allowedRole', [UserRole.SELLER])
    @UseGuards(RolesGuard)
    @ApiOperation({summary: 'Edit a product'})
    @Patch(':id')
    @ApiConsumes('multipart/form-data')
    @ApiBody({type: UpdateProductDto})
    @UseInterceptors(createDynamicFileInterceptor(10))
    async editProduct(
        @Param('id') id: string,
        @Body() rawData: any,
        @UploadedFiles() files: any,
    ){
        const transformedData = this.transformData(rawData, files);
        return await this.editProductService.editProduct(id, transformedData);
    }
}