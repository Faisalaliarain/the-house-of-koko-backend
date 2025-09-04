import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category, CategoryDocument } from '../../entities/category.entity';

@Injectable()
export class CategoryService {
  private readonly logger = new Logger(CategoryService.name);

  constructor(
    @InjectModel(Category.name) private readonly categoryModel: Model<CategoryDocument>,
  ) {}

  async findByTitle(title: string): Promise<CategoryDocument | null> {
    return this.categoryModel.findOne({ title }).exec();
  }

  async findBySlug(slug: string): Promise<CategoryDocument | null> {
    return this.categoryModel.findOne({ slug }).exec();
  }

  async create(data: { title: string; description?: string; type: string; isActive?: boolean }) {
    const doc = new this.categoryModel(data);
    return doc.save();
  }

  async findAll(): Promise<CategoryDocument[]> {
    return this.categoryModel.find({}).exec();
  }

  async count(): Promise<number> {
    return this.categoryModel.countDocuments().exec();
  }

  async hasCategories(): Promise<boolean> {
    try {
      const c = await this.count();
      return c > 0;
    } catch (e) {
      this.logger.error('Failed counting categories', e?.message);
      return false;
    }
  }
}
