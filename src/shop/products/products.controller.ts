import {
    Body,
    Controller,
    Delete,
    Get, HttpStatus,
    Param,
    Patch,
    Post,
    Query,
    SetMetadata,
    UploadedFiles,
    UseGuards,
    UseInterceptors
} from "@nestjs/common";
import {AddProductService} from "./service/add.product.service";
import {CreateProductDto} from "./dto/create-product.dto";
import {ApiBody, ApiConsumes, ApiOperation, ApiQuery, ApiResponse} from "@nestjs/swagger";
import {UserRole} from "../../../enums/profile.enum";
import {RolesGuard} from "../../jwt/roles.guard";
import {GetUser} from "../../jwt/get.user.decorator";
import {createDynamicFileInterceptor} from "../Common/Interceptor/dynamic.interptor";
import {EditProductService} from "./service/edit.product.service";
import {UpdateProductDto} from "./dto/update-product.dto";
import {ProductsService} from "./products.service";
import {SearchProductService} from "./service/search.product.service";
import {ERROR_CREATING_CATEGORY} from "../../../constants/response.constant";


@Controller('products')
export class ProductsController {
    constructor(
        private readonly addProductService: AddProductService,
        private readonly editProductService: EditProductService,
        private readonly productService: ProductsService,
        private readonly searchProductService: SearchProductService
    ) {
    }

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
        return images.length > 0 ? {...data, images} : data;
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
    ) {
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
    ) {
        const transformedData = this.transformData(rawData, files);
        return await this.editProductService.editProduct(id, transformedData);
    }

    @SetMetadata('allowedRole', [UserRole.SELLER])
    @UseGuards(RolesGuard)
    @ApiOperation({summary: 'Remove a product image'})
    @Delete('image/:id')
    async deleteImageFromProduct(
        @Param('id') id: string,
        @GetUser('sub') user: string
    ) {
        return this.productService.deleteImageFromProduct(id, user);
    }

    @SetMetadata('allowedRole', [UserRole.ADMIN, UserRole.SELLER, UserRole.CLIENT])
    @UseGuards(RolesGuard)
    @ApiOperation({summary: 'Fetch all products and can filter'})
    @Get()
    @ApiOperation({summary: 'Get all products with filters'})
    @ApiQuery({name: 'page', required: false, type: Number})
    @ApiQuery({name: 'itemsPerPage', required: false, type: Number})
    @ApiQuery({name: 'name', required: false, type: String})
    @ApiQuery({name: 'minPrice', required: false, type: Number})
    @ApiQuery({name: 'maxPrice', required: false, type: Number})
    @ApiQuery({name: 'categories', required: false, type: String, isArray: true})
    @ApiQuery({name: 'shop', required: false, type: String})
    @ApiQuery({name: 'productFor', required: false, type: String})
    async getAllProducts(
        @Query('productFor') productFor: string,
        @Query('page') page?: number,
        @Query('itemsPerPage') itemsPerPage?: number,
        @Query('name') name?: string,
        @Query('minPrice') minPrice?: number,
        @Query('maxPrice') maxPrice?: number,
        @Query('categories') categories?: string | string[],
        @Query('shop') shop?: string,
    ) {
        return this.searchProductService.getProducts(
            productFor,
            page,
            itemsPerPage,
            name,
            minPrice,
            maxPrice,
            categories,
            shop
        );
    }

    @SetMetadata('allowedRole', [UserRole.ADMIN, UserRole.SELLER, UserRole.CLIENT])
    @UseGuards(RolesGuard)
    @ApiOperation({summary: 'Fetch a product by id'})
    @Get(':id')
    @ApiOperation({summary: 'Get product infos'})
    async getInfoProduct(
        @Param('id') id: string,
    ){
        return this.searchProductService.getInfoProduct(id);
    }
}