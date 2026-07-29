import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { Admin } from '../auth/decorators/admin.decorator';
import { CurrentUser } from '../auth/decorators/user.decorator';
import { AdminService } from './admin.service';
import {
  AdminCategoriesQueryDto,
  AdminIngredientsQueryDto,
  AdminOrdersQueryDto,
  AdminProductsQueryDto,
  AdminUsersQueryDto,
} from './dto/admin-query.dto';
import {
  AdminCreateProductDto,
  AdminUpdateProductDto,
} from './dto/admin-product.dto';
import {
  AdminCreateCategoryDto,
  AdminUpdateCategoryDto,
} from './dto/admin-category.dto';
import {
  AdminCreateIngredientDto,
  AdminUpdateIngredientDto,
} from './dto/admin-ingredient.dto';
import { AdminUpdateOrderStatusDto } from './dto/admin-order.dto';
import { AdminCreateUserDto, AdminUpdateUserDto } from './dto/admin-user.dto';
import { ReviewsService } from '../reviews/reviews.service';
import { AdminReviewsQueryDto } from '../reviews/dto/reviews-query.dto';

@Admin()
@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly reviewsService: ReviewsService,
  ) {}

  @Get('dashboard')
  getDashboard() {
    return this.adminService.getDashboard();
  }

  @Get('products')
  getProducts(@Query() query: AdminProductsQueryDto) {
    return this.adminService.getProducts(query);
  }

  @Get('products/:id')
  getProduct(@Param('id') id: string) {
    return this.adminService.getProduct(id);
  }

  @Post('products')
  createProduct(
    @CurrentUser('id') adminId: string,
    @Body() dto: AdminCreateProductDto,
  ) {
    return this.adminService.createProduct(adminId, dto);
  }

  @Patch('products/:id')
  updateProduct(
    @CurrentUser('id') adminId: string,
    @Param('id') id: string,
    @Body() dto: AdminUpdateProductDto,
  ) {
    return this.adminService.updateProduct(adminId, id, dto);
  }

  @Delete('products/:id')
  deleteProduct(@CurrentUser('id') adminId: string, @Param('id') id: string) {
    return this.adminService.deleteProduct(adminId, id);
  }

  @Get('orders')
  getOrders(@Query() query: AdminOrdersQueryDto) {
    return this.adminService.getOrders(query);
  }

  @Get('orders/:id')
  getOrder(@Param('id') id: string) {
    return this.adminService.getOrder(id);
  }

  @Patch('orders/:id/status')
  updateOrderStatus(
    @CurrentUser('id') adminId: string,
    @Param('id') id: string,
    @Body() dto: AdminUpdateOrderStatusDto,
  ) {
    return this.adminService.updateOrderStatus(adminId, id, dto);
  }

  @Delete('orders/:id')
  deleteOrder(@CurrentUser('id') adminId: string, @Param('id') id: string) {
    return this.adminService.deleteOrder(adminId, id);
  }

  @Get('reviews')
  getReviews(@Query() query: AdminReviewsQueryDto) {
    return this.reviewsService.getAdminReviews(query);
  }

  @Delete('reviews/:id')
  deleteReview(@CurrentUser('id') adminId: string, @Param('id') id: string) {
    return this.reviewsService.deleteReviewAsAdmin(adminId, id);
  }

  @Get('users')
  getUsers(@Query() query: AdminUsersQueryDto) {
    return this.adminService.getUsers(query);
  }

  @Post('users')
  createUser(
    @CurrentUser('id') adminId: string,
    @Body() dto: AdminCreateUserDto,
  ) {
    return this.adminService.createUser(adminId, dto);
  }

  @Patch('users/:id')
  updateUser(
    @CurrentUser('id') adminId: string,
    @Param('id') id: string,
    @Body() dto: AdminUpdateUserDto,
  ) {
    return this.adminService.updateUser(adminId, id, dto);
  }

  @Delete('users/:id')
  deleteUser(@CurrentUser('id') adminId: string, @Param('id') id: string) {
    return this.adminService.deleteUser(adminId, id);
  }

  @Get('categories')
  getCategories(@Query() query: AdminCategoriesQueryDto) {
    return this.adminService.getCategories(query);
  }

  @Post('categories')
  createCategory(
    @CurrentUser('id') adminId: string,
    @Body() dto: AdminCreateCategoryDto,
  ) {
    return this.adminService.createCategory(adminId, dto);
  }

  @Patch('categories/:id')
  updateCategory(
    @CurrentUser('id') adminId: string,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AdminUpdateCategoryDto,
  ) {
    return this.adminService.updateCategory(adminId, id, dto);
  }

  @Delete('categories/:id')
  deleteCategory(
    @CurrentUser('id') adminId: string,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.adminService.deleteCategory(adminId, id);
  }

  @Get('ingredients')
  getIngredients(@Query() query: AdminIngredientsQueryDto) {
    return this.adminService.getIngredients(query);
  }

  @Post('ingredients')
  createIngredient(
    @CurrentUser('id') adminId: string,
    @Body() dto: AdminCreateIngredientDto,
  ) {
    return this.adminService.createIngredient(adminId, dto);
  }

  @Patch('ingredients/:id')
  updateIngredient(
    @CurrentUser('id') adminId: string,
    @Param('id') id: string,
    @Body() dto: AdminUpdateIngredientDto,
  ) {
    return this.adminService.updateIngredient(adminId, id, dto);
  }

  @Delete('ingredients/:id')
  deleteIngredient(
    @CurrentUser('id') adminId: string,
    @Param('id') id: string,
  ) {
    return this.adminService.deleteIngredient(adminId, id);
  }
}
