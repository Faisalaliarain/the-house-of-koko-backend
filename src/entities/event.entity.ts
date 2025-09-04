import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type EventDocument = Event & Document;

@Schema({ timestamps: true, collection: 'events' })
export class Event {
  @Prop({ required: true, unique: true })
  title: string;

  @Prop({ type: Types.ObjectId, ref: 'Category', required: true })
  category: Types.ObjectId;

  @Prop({
    type: {
      min: { type: Number, required: true },
      max: { type: Number, required: true },
      currency: { type: String, default: 'GBP' },
    },
    required: true,
  })
  price: { min: number; max: number; currency: string };

  @Prop()
  status?: string;

  @Prop({
    type: {
      date: { type: String },
      start_time: { type: String },
      end_time: { type: String },
      timezone: { type: String, default: 'Europe/London' },
    },
  })
  datetime?: { date?: string; start_time?: string; end_time?: string; timezone?: string };

  @Prop({
    type: {
      name: { type: String },
      address: { type: String },
      city: { type: String },
      country: { type: String },
    },
  })
  venue?: { name?: string; address?: string | null; city?: string; country?: string };

  @Prop()
  image_url?: string;

  @Prop()
  description?: string;
}

export const EventSchema = SchemaFactory.createForClass(Event);

