import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Event, EventDocument } from '../../entities/event.entity';

@Injectable()
export class EventService {
  private readonly logger = new Logger(EventService.name);

  constructor(
    @InjectModel(Event.name) private readonly eventModel: Model<EventDocument>,
  ) {}

  async findByTitle(title: string): Promise<EventDocument | null> {
    return this.eventModel.findOne({ title }).exec();
  }

  async findById(id: string): Promise<EventDocument | null> {
    return this.eventModel.findById(id).populate('category').exec();
  }

  async findByCategoryId(categoryId: string): Promise<EventDocument[]> {
    return this.eventModel.find({ category: categoryId }).populate('category').exec();
  }

  async create(data: {
    title: string;
    category: Types.ObjectId;
    price: { min: number; max: number; currency: string };
    status?: string;
    datetime?: { date?: string; start_time?: string; end_time?: string; timezone?: string };
    venue?: { name?: string; address?: string | null; city?: string; country?: string };
    image_url?: string;
    description?: string;
  }) {
    const doc = new this.eventModel(data);
    return doc.save();
  }

  async count(): Promise<number> {
    return this.eventModel.countDocuments().exec();
  }

  async hasEvents(): Promise<boolean> {
    try {
      return (await this.count()) > 0;
    } catch (e) {
      this.logger.error('Failed counting events', e?.message);
      return false;
    }
  }

  async findAll(): Promise<EventDocument[]> {
    return this.eventModel.find({}).populate('category').exec();
  }

  async findSeats(eventId: string) {
  const event = await this.eventModel.findById(eventId).exec();
  if (!event) return null;

  // Auto-expire reservations if time passed
  event.seats.forEach(seat => {
    if (seat.status === 'reserved' && seat.reservedUntil && seat.reservedUntil < new Date()) {
      seat.status = 'available';
      seat.reservedUntil = null;
    }
  });

  // Save only if something changed
  await event.save();

  return event.seats;
}

async reserveSeat(eventId: string, seatNumber: string, userId: string) {
  const event = await this.eventModel.findById(eventId).exec();
  if (!event) throw new Error('Event not found');

  const seat = event.seats.find(s => s.seatNumber === seatNumber);
  if (!seat) throw new Error('Seat not found');

  if (seat.status !== 'available') throw new Error('Seat not available');

  seat.status = 'reserved';
  seat.userId = new Types.ObjectId(userId);
  seat.reservedUntil = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

  await event.save();
  return seat;
}

async bookSeat(eventId: string, seatNumber: string, userId: string) {
  const event = await this.eventModel.findById(eventId).exec();
  if (!event) throw new Error('Event not found');

  const seat = event.seats.find(s => s.seatNumber === seatNumber);
  if (!seat) throw new Error('Seat not found');

  // validate reservation
  if (seat.status !== 'reserved' || String(seat.userId) !== userId) {
    throw new Error('Seat is not reserved by this user');
  }
  if (seat.reservedUntil && seat.reservedUntil < new Date()) {
    seat.status = 'available';
    seat.userId = undefined;
    seat.reservedUntil = undefined;
    await event.save();
    throw new Error('Reservation expired');
  }

  seat.status = 'booked';
  seat.reservedUntil = undefined;
  await event.save();

  return seat;
}

}

