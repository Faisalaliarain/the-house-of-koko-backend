import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Membership, MembershipDocument, MembershipStatus } from '../../entities/membership.entity';
import { User, UserDocument } from '../../entities/user.entity';
import { Plan, PlanDocument } from '../../entities/plan.entity';
import { Payment, PaymentDocument } from '../../entities/payment.entity';

@Injectable()
export class MembershipService {
  private readonly logger = new Logger(MembershipService.name);

  constructor(
    @InjectModel(Membership.name) private readonly membershipModel: Model<MembershipDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Plan.name) private readonly planModel: Model<PlanDocument>,
    @InjectModel(Payment.name) private readonly paymentModel: Model<PaymentDocument>,
  ) {}

  /**
   * Get user's current active membership
   */
  async getCurrentMembership(userId: string): Promise<MembershipDocument | null> {
    return await this.membershipModel
      .findOne({
        userId: new Types.ObjectId(userId),
        status: MembershipStatus.ACTIVE,
        endDate: { $gt: new Date() },
      })
      .populate('planId', 'name price currency features')
      .populate('paymentId', 'amount currency paidAt')
      .exec();
  }

  /**
   * Get user's membership history
   */
  async getUserMemberships(userId: string): Promise<MembershipDocument[]> {
    return await this.membershipModel
      .find({ userId: new Types.ObjectId(userId) })
      .populate('planId', 'name price currency features')
      .populate('paymentId', 'amount currency paidAt')
      .sort({ createdAt: -1 })
      .exec();
  }

  /**
   * Get membership by ID
   */
  async getMembershipById(membershipId: string): Promise<MembershipDocument> {
    const membership = await this.membershipModel
      .findById(membershipId)
      .populate('userId', 'name email')
      .populate('planId', 'name price currency features')
      .populate('paymentId', 'amount currency paidAt')
      .exec();

    if (!membership) {
      throw new NotFoundException('Membership not found');
    }

    return membership;
  }

  /**
   * Check if user has active membership
   */
  async hasActiveMembership(userId: string): Promise<boolean> {
    const membership = await this.membershipModel.findOne({
      userId: new Types.ObjectId(userId),
      status: MembershipStatus.ACTIVE,
      endDate: { $gt: new Date() },
    }).exec();

    return !!membership;
  }

  /**
   * Get membership status for user
   */
  async getMembershipStatus(userId: string): Promise<{
    hasActiveMembership: boolean;
    currentMembership: MembershipDocument | null;
    expiresAt: Date | null;
    daysRemaining: number | null;
  }> {
    const currentMembership = await this.getCurrentMembership(userId);
    
    if (!currentMembership) {
      return {
        hasActiveMembership: false,
        currentMembership: null,
        expiresAt: null,
        daysRemaining: null,
      };
    }

    const now = new Date();
    const daysRemaining = Math.ceil(
      (currentMembership.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    return {
      hasActiveMembership: true,
      currentMembership,
      expiresAt: currentMembership.endDate,
      daysRemaining: Math.max(0, daysRemaining),
    };
  }

  /**
   * Cancel membership
   */
  async cancelMembership(membershipId: string, reason?: string): Promise<MembershipDocument> {
    const membership = await this.membershipModel.findById(membershipId).exec();
    if (!membership) {
      throw new NotFoundException('Membership not found');
    }

    if (membership.status !== MembershipStatus.ACTIVE) {
      throw new BadRequestException('Only active memberships can be cancelled');
    }

    membership.status = MembershipStatus.CANCELLED;
    membership.cancelledAt = new Date();
    membership.cancellationReason = reason;
    await membership.save();

    this.logger.log(`Membership cancelled: ${membershipId}`);

    return membership;
  }

  /**
   * Suspend membership
   */
  async suspendMembership(membershipId: string, reason?: string): Promise<MembershipDocument> {
    const membership = await this.membershipModel.findById(membershipId).exec();
    if (!membership) {
      throw new NotFoundException('Membership not found');
    }

    if (membership.status !== MembershipStatus.ACTIVE) {
      throw new BadRequestException('Only active memberships can be suspended');
    }

    membership.status = MembershipStatus.SUSPENDED;
    membership.suspendedAt = new Date();
    membership.suspensionReason = reason;
    await membership.save();

    this.logger.log(`Membership suspended: ${membershipId}`);

    return membership;
  }

  /**
   * Reactivate membership
   */
  async reactivateMembership(membershipId: string): Promise<MembershipDocument> {
    const membership = await this.membershipModel.findById(membershipId).exec();
    if (!membership) {
      throw new NotFoundException('Membership not found');
    }

    if (membership.status !== MembershipStatus.SUSPENDED) {
      throw new BadRequestException('Only suspended memberships can be reactivated');
    }

    membership.status = MembershipStatus.ACTIVE;
    membership.reactivatedAt = new Date();
    membership.suspendedAt = undefined;
    membership.suspensionReason = undefined;
    await membership.save();

    this.logger.log(`Membership reactivated: ${membershipId}`);

    return membership;
  }

  /**
   * Extend membership
   */
  async extendMembership(membershipId: string, days: number): Promise<MembershipDocument> {
    const membership = await this.membershipModel.findById(membershipId).exec();
    if (!membership) {
      throw new NotFoundException('Membership not found');
    }

    if (membership.status !== MembershipStatus.ACTIVE) {
      throw new BadRequestException('Only active memberships can be extended');
    }

    const newEndDate = new Date(membership.endDate);
    newEndDate.setDate(newEndDate.getDate() + days);
    membership.endDate = newEndDate;
    await membership.save();

    this.logger.log(`Membership extended by ${days} days: ${membershipId}`);

    return membership;
  }

  /**
   * Get all active memberships (admin function)
   */
  async getAllActiveMemberships(): Promise<MembershipDocument[]> {
    return await this.membershipModel
      .find({
        status: MembershipStatus.ACTIVE,
        endDate: { $gt: new Date() },
      })
      .populate('userId', 'name email')
      .populate('planId', 'name price currency')
      .sort({ createdAt: -1 })
      .exec();
  }

  /**
   * Get expiring memberships (for notifications)
   */
  async getExpiringMemberships(days: number = 7): Promise<MembershipDocument[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    return await this.membershipModel
      .find({
        status: MembershipStatus.ACTIVE,
        endDate: {
          $gte: new Date(),
          $lte: futureDate,
        },
      })
      .populate('userId', 'name email')
      .populate('planId', 'name')
      .exec();
  }

  /**
   * Update expired memberships
   */
  async updateExpiredMemberships(): Promise<number> {
    const result = await this.membershipModel.updateMany(
      {
        status: MembershipStatus.ACTIVE,
        endDate: { $lt: new Date() },
      },
      {
        $set: {
          status: MembershipStatus.EXPIRED,
        },
      },
    );

    this.logger.log(`Updated ${result.modifiedCount} expired memberships`);

    return result.modifiedCount;
  }
}
