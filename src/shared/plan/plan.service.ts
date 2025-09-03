import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Plan, PlanDocument } from '../../entities/plan.entity';
import { PlanSeedData } from '../../utils/interfaces/plan-config.interface';

@Injectable()
export class PlanService {
  private readonly logger = new Logger(PlanService.name);

  constructor(
    @InjectModel(Plan.name) private readonly planModel: Model<PlanDocument>,
  ) {}

  /**
   * Find a plan by name
   */
  async findByName(name: string): Promise<PlanDocument | null> {
    try {
      return await this.planModel.findOne({ name }).exec();
    } catch (error) {
      this.logger.error(`Failed to find plan by name "${name}":`, error.message);
      throw error;
    }
  }

  /**
   * Create a new plan
   */
  async create(planData: PlanSeedData): Promise<PlanDocument> {
    try {
      const newPlan = new this.planModel(planData);
      return await newPlan.save();
    } catch (error) {
      this.logger.error(`Failed to create plan "${planData.name}":`, error.message);
      throw error;
    }
  }

  /**
   * Get all plans
   */
  async findAll(): Promise<PlanDocument[]> {
    try {
      return await this.planModel.find({ isActive: true }).exec();
    } catch (error) {
      this.logger.error('Failed to find all plans:', error.message);
      throw error;
    }
  }

  /**
   * Count total plans
   */
  async count(): Promise<number> {
    try {
      return await this.planModel.countDocuments().exec();
    } catch (error) {
      this.logger.error('Failed to count plans:', error.message);
      throw error;
    }
  }

  /**
   * Check if any plans exist
   */
  async hasPlans(): Promise<boolean> {
    try {
      const count = await this.count();
      return count > 0;
    } catch (error) {
      this.logger.error('Failed to check if plans exist:', error.message);
      return false;
    }
  }

  /**
   * Find plan by Stripe product ID
   */
  async findByStripeProductId(stripeProductId: string): Promise<PlanDocument | null> {
    try {
      return await this.planModel.findOne({ stripeProductId }).exec();
    } catch (error) {
      this.logger.error(`Failed to find plan by Stripe product ID "${stripeProductId}":`, error.message);
      throw error;
    }
  }

  /**
   * Find plan by Stripe price ID
   */
  async findByStripePriceId(stripePriceId: string): Promise<PlanDocument | null> {
    try {
      return await this.planModel.findOne({ stripePriceId }).exec();
    } catch (error) {
      this.logger.error(`Failed to find plan by Stripe price ID "${stripePriceId}":`, error.message);
      throw error;
    }
  }

  /**
   * Update plan
   */
  async update(id: string, updateData: Partial<PlanSeedData>): Promise<PlanDocument | null> {
    try {
      return await this.planModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
    } catch (error) {
      this.logger.error(`Failed to update plan with ID "${id}":`, error.message);
      throw error;
    }
  }

  /**
   * Delete plan
   */
  async delete(id: string): Promise<boolean> {
    try {
      const result = await this.planModel.findByIdAndDelete(id).exec();
      return !!result;
    } catch (error) {
      this.logger.error(`Failed to delete plan with ID "${id}":`, error.message);
      throw error;
    }
  }
}
