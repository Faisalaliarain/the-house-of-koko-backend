import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type EventDocument = Event & Document;

@Schema({ _id: false })
export class Seat {
  @Prop({ required: true })
  seatNumber: string; // e.g. "A1", "B2"

  @Prop({ required: true })
  price: number;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  userId?: Types.ObjectId;
  
  @Prop({ default: 'available', enum: ['available', 'reserved', 'booked'] })
  status: 'available' | 'reserved' | 'booked';

  @Prop({ type: Date, default: null })
  reservedUntil?: Date; // auto-expire reservation after 10 min
}
export const SeatSchema = SchemaFactory.createForClass(Seat);

@Schema({ timestamps: true, collection: 'events' })
export class Event {
  @Prop({ required: true, unique: true })
  title: string;

  @Prop({ type: Types.ObjectId, ref: 'Category', required: true })
  category: Types.ObjectId;

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

  @Prop({ type: [SeatSchema], default: [] })
  seats: Seat[];
}

export const EventSchema = SchemaFactory.createForClass(Event);
