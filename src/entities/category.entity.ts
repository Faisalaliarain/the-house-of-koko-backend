import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CategoryDocument = Category & Document;

@Schema({ timestamps: true, collection: 'categories' })
export class Category {
  @Prop({ required: true, unique: true })
  title: string;

  @Prop({ required: false })
  description?: string;

  @Prop({ required: true, unique: true, lowercase: true })
  slug: string;

  @Prop({ required: true })
  type: string; // e.g., Physical, Digital, Hybrid, Getaway / Premium, etc.

  @Prop({ default: true })
  isActive: boolean;
}

export const CategorySchema = SchemaFactory.createForClass(Category);

// Simple slugify utility
function slugify(input: string): string {
  return input
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Auto-generate slug from title if not provided
CategorySchema.pre('validate', function (this: any, next) {
  if (!this.slug && this.title) {
    this.slug = slugify(this.title);
  }
  next();
});
