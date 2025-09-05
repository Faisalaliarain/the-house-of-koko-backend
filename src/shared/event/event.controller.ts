import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { EventService } from './event.service';
import { CategoryService } from '../category/category.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

class ReserveSeatDto {
  userId: string;
  seatNumber: string;
}

class BookSeatDto {
  userId: string;
  seatNumber: string;
}


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

  @Get(':id/seats')
  @ApiOperation({ summary: 'Get seats for an event' })
  @ApiResponse({ status: 200, description: 'Seats retrieved successfully' })
  async listSeats(@Param('id') id: string) {
    const seats = await this.eventService.findSeats(id);
    if (!seats) {
      return { message: 'Event not found', data: [] };
    }
    return { message: 'OK', data: seats };
  }

   @Post(':id/seats/reserve')
  @ApiOperation({ summary: 'Reserve a seat' })
  async reserve(
    @Param('id') id: string,
    @Body() body: ReserveSeatDto,
  ) {
    const seat = await this.eventService.reserveSeat(id, body.seatNumber, body.userId);
    return { message: 'Seat reserved for 10 minutes', data: seat };
  }

  @Post(':id/seats/book')
  @ApiOperation({ summary: 'Book a seat' })
  async book(
    @Param('id') id: string,
    @Body() body: any,
  ) {
    const seat = await this.eventService.bookSeat(id, body.seatNumber, body.userId);
    return { message: 'Seat booked successfully', data: seat };
  }
}

