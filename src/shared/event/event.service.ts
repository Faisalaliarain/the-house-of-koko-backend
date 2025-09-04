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
}
