import { Controller, Get, Param } from '@nestjs/common';
import { EventService } from './event.service';
import { CategoryService } from '../category/category.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Event')
@Controller('event')

export class EventController {
  constructor(
    private readonly eventService: EventService,
    private readonly categoryService: CategoryService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all available events' })
  @ApiResponse({ status: 200, description: 'Events retrieved successfully' })
  async list() {
    const data = await this.eventService.findAll();
    return { message: 'OK', data };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an event by ID' })
  @ApiResponse({ status: 200, description: 'Event retrieved successfully' })
  async getById(@Param('id') id: string) {
    const data = await this.eventService.findById(id);
    return { message: 'OK', data };
  }

  @Get('by-category/:slug')
  @ApiOperation({ summary: 'Get events by category slug' })
  @ApiResponse({ status: 200, description: 'Events retrieved successfully' })
  async listByCategory(@Param('slug') slug: string) {
    const category = await this.categoryService.findBySlug(slug);
    if (!category) return { message: 'Category not found', data: [] };
    const data = await this.eventService.findByCategoryId(String(category._id));
    return { message: 'OK', data };
  }
}
