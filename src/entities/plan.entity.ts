import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PlanDocument = Plan & Document;

@Schema({ timestamps: true, collection: 'plans' })
export class Plan {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: [String], required: true })
  features: string[];

  @Prop({ required: true, type: Number })
  price: number;

  @Prop({ default: 'GBP' })
  currency: string;

  @Prop({ required: true })
  stripeProductId: string;

  @Prop({ required: true })
  stripePriceId: string;

  @Prop({ default: true })
  isActive: boolean;
}

export const PlanSchema = SchemaFactory.createForClass(Plan);
