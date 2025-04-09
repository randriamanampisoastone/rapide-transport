import {
    Body,
    Controller,
    Delete,
    Get,
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
import {ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiQuery} from "@nestjs/swagger";
import {UserRole} from "../../../enums/profile.enum";
import {RolesGuard} from "../../jwt/roles.guard";
import {GetUser} from "../../jwt/get.user.decorator";
import {Public} from "../../jwt/public.decorator";
import {createDynamicFileInterceptor} from "../Common/Interceptor/dynamic.interptor";
import {EditProductService} from "./service/edit.product.service";
import {UpdateProductDto} from "./dto/update-product.dto";
import {ProductsService} from "./products.service";
import {SearchProductService} from "./service/search.product.service";
import {FavoriteService} from "./service/favorites/favorites.service";
import {CreateReviewDto} from "./dto/create-review.dto";
import {ReviewService} from "./service/reviews/review.service";
import {VariantService} from "./service/variants/variant.service";
import {AddVariantDto, EditVariantDto} from "./dto/variant.dto";
import {DiscountService} from "./service/discount/discount.service";
import {AddDiscountDTO} from "./dto/discount.dto";
import {GetProductsDto} from "./dto/get-products.dto";

@Controller('products')
export class ProductsController {
    constructor(
        private readonly addProductService: AddProductService,
        private readonly editProductService: EditProductService,
        private readonly productService: ProductsService,
        private readonly searchProductService: SearchProductService,
        private readonly favoriteService: FavoriteService,
        private readonly reviewService: ReviewService,
        private readonly variantService: VariantService,
        private readonly discountService: DiscountService
    ) {
    }

//----// ### Product part
    private transformData(rawData: any, files: any) {
        // Reshape the form data with optional fields
        const data: any = {};

        // Check and assign each field only if it exists in rawData
        if (rawData.name !== undefined) data.name = rawData.name;
        if (rawData.description !== undefined) data.description = rawData.description;
        if (rawData.price !== undefined) data.price = Number(rawData.price);
        if (rawData.inventory !== undefined) data.inventory = Number(rawData.inventory);
        if (rawData.toWear !== undefined) data.toWear = rawData.toWear === 'true';

        // Handle categories if present
        if (rawData.categories) {
            data.categories = Array.isArray(rawData.categories)
                ? rawData.categories
                : [rawData.categories];
        }

        // Process variants
        const variants = [];
        const variantKeys = Object.keys(rawData).filter(key => key.match(/variants\[\d+\]|variants\d+\]/));

        if (variantKeys) {
            // Find all unique variant indices
            const variantIndices = new Set();
            variantKeys.forEach(key => {
                // Handle both correct 'variants[1]size' and incorrect 'variants1]size' formats
                const match = key.match(/variants\[(\d+)\]|variants(\d+)\]/);
                if (match) {
                    variantIndices.add(match[1] || match[2]);
                }
            });

            // Process each variant
            variantIndices.forEach(index => {
                const variant: any = {};

                // Check both possible formats for each property
                const correctFormat = `variants[${index}]`;
                const incorrectFormat = `variants${index}]`;

                // Check for color
                const colorKey = Object.keys(rawData).find(k =>
                    k === `${correctFormat}color` || k === `${incorrectFormat}color`);
                if (colorKey) variant.color = rawData[colorKey];

                // Check for size
                const sizeKey = Object.keys(rawData).find(k =>
                    k === `${correctFormat}size` || k === `${incorrectFormat}size`);
                if (sizeKey) variant.size = rawData[sizeKey];

                // Check for stock
                const stockKey = Object.keys(rawData).find(k =>
                    k === `${correctFormat}stock` || k === `${incorrectFormat}stock`);
                if (stockKey) variant.stock = Number(rawData[stockKey]);

                variants.push(variant);
            });

            if (variants.length > 0) {
                data.variants = variants;
            }
        }

        // Handle ingredients if present
        if (rawData.ingredients) {
            data.ingredients = Array.isArray(rawData.ingredients)
                ? rawData.ingredients
                : [rawData.ingredients];
        }

        // Handle ingredients if present
        if (rawData.sauces) {
            data.sauces = Array.isArray(rawData.sauces)
                ? rawData.sauces
                : [rawData.sauces];
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

    @ApiOperation({ summary: 'Fetch products for public users' })
    @Get('public/fetch/all')
    @Public()
    async getPublicProducts(
        @Query() query: GetProductsDto,
    ) {
        return this.searchProductService.getProducts(
            query.productFor,
            null, // Explicitly pass null for public access
            query.page,
            query.itemsPerPage,
            query.name,
            query.minPrice,
            query.maxPrice,
            query.color,
            query.size,
            query.categories,
            query.shop
        );
    }

    @SetMetadata('allowedRole', [UserRole.SELLER, UserRole.CLIENT])
    @UseGuards(RolesGuard)
    @ApiOperation({summary: 'Fetch all products and can filter'})
    @Get()
    @ApiBearerAuth()
    async getAllProducts(
        @Query() query: GetProductsDto,
        @GetUser('sub') user: string,
    ) {
        return this.searchProductService.getProducts(
            query.productFor,
            user,
            query.page,
            query.itemsPerPage,
            query.name,
            query.minPrice,
            query.maxPrice,
            query.color,
            query.size,
            query.categories,
            query.shop
        );
    }

    @ApiOperation({summary: 'Get a product infos by id for public users'})
    @Get('public/:id')
    @Public()
    async getInfoProductPublic(
        @Param('id') id: string
    ) {
        return this.searchProductService.getInfoProduct(id, null);
    }

    @SetMetadata('allowedRole', [UserRole.SELLER, UserRole.CLIENT])
    @UseGuards(RolesGuard)
    @ApiOperation({summary: 'Fetch a product by id'})
    @Get(':id')
    async getInfoProduct(
        @Param('id') id: string,
        @GetUser('sub') user: string,
    ) {
        return this.searchProductService.getInfoProduct(id, user);
    }

//----// ### Favorite part
    @SetMetadata('allowedRole', [UserRole.CLIENT])
    @UseGuards(RolesGuard)
    @ApiOperation({summary: 'Add a product to favorites'})
    @Post('favorite/:productId')
    async addToFavorite(
        @GetUser('sub') userId: string,
        @Param('productId') productId: string
    ) {
        return this.favoriteService.addToFavorites(userId, productId);
    }

    @SetMetadata('allowedRole', [UserRole.CLIENT])
    @UseGuards(RolesGuard)
    @ApiOperation({summary: 'Remove a product from favorites'})
    @Delete('favorite/:productId')
    async removeFromFavorites(
        @GetUser('sub') userId: string,
        @Param('productId') productId: string
    ) {
        return this.favoriteService.removeFromFavorite(userId, productId);
    }

    @SetMetadata('allowedRole', [UserRole.CLIENT])
    @UseGuards(RolesGuard)
    @ApiOperation({summary: 'Get user favorites'})
    @Get('favorite')
    async getUserFavorites(
        @GetUser('sub') userId: string
    ) {
        return this.favoriteService.getUserFavorites(userId);
    }

//----// ### Review part
    @SetMetadata('allowedRole', [UserRole.CLIENT])
    @UseGuards(RolesGuard)
    @ApiOperation({summary: 'Create a review user on a product'})
    @ApiBody({type: CreateReviewDto})
    @Post('review')
    async createReview(
        @GetUser('sub') userId: string,
        @Body() reviewDto: CreateReviewDto
    ) {
        return this.reviewService.createReview(userId, reviewDto);
    }

    @SetMetadata('allowedRole', [UserRole.CLIENT])
    @UseGuards(RolesGuard)
    @ApiOperation({summary: 'Update a review user on a product'})
    @Patch('review')
    async updateReview(
        @GetUser('sub') userId: string,
        @Body() updateReviewDto: {
            rating: number;
            comment: string;
        }
    ) {
        return this.reviewService.updateReview(
            userId,
            updateReviewDto.rating,
            updateReviewDto.comment
        );
    }

    @SetMetadata('allowedRole', [UserRole.CLIENT])
    @UseGuards(RolesGuard)
    @ApiOperation({summary: 'Delete a review user on a product'})
    @ApiBody({type: CreateReviewDto})
    @Delete('review/:reviewId')
    async deleteReview(
        @Param('reviewId') reviewId: string,
        @GetUser('sub') userId: string
    ) {
        return this.reviewService.deleteReview(userId, reviewId);
    }

    @ApiOperation({summary: 'Get reviews of a product'})
    @Get('review/:productId')
    async getProductReviews(
        @Param('productId') productId: string
    ) {
        return this.reviewService.getProductReviews(productId);
    }

    @SetMetadata('allowedRole', [UserRole.SELLER])
    @UseGuards(RolesGuard)
    @ApiOperation({summary: 'Add a variant to a product when update it'})
    @Post('variant/:productId')
    async addProductVariant(
        @GetUser('sub') userId: string,
        @Param('productId') productId: string,
        @Body() data: AddVariantDto
    ) {
        return this.variantService.createVariant(userId, productId, data);
    }

    @SetMetadata('allowedRole', [UserRole.SELLER])
    @UseGuards(RolesGuard)
    @ApiOperation({summary: 'Edit a variant to a product when update it'})
    @Patch('variant/:productId')
    async editProductVariant(
        @GetUser('sub') userId: string,
        @Param('productId') productId: string,
        @Body() data: EditVariantDto
    ) {
        return this.variantService.updateVariant(userId, productId, data);
    }

    @SetMetadata('allowedRole', [UserRole.SELLER])
    @UseGuards(RolesGuard)
    @ApiOperation({summary: 'Add a discount ot a product'})
    @Post('discount')
    async addDiscountToProduct(
        @Body() data: AddDiscountDTO
    ){
        return this.discountService.createDiscount(data);
    }
}