import { Controller, Get, Param } from '@nestjs/common';
import { CategoryService } from './category.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Category')
@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  @ApiOperation({ summary: 'Get all available categories' })
  @ApiResponse({ status: 200, description: 'Categories retrieved successfully' })
  async list() {
    const data = await this.categoryService.findAll();
    return { message: 'OK', data };
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get a category by slug' })
  @ApiResponse({ status: 200, description: 'Category retrieved successfully' })
  async getBySlug(@Param('slug') slug: string) {
    const data = await this.categoryService.findBySlug(slug);
    return { message: 'OK', data };
  }
}
