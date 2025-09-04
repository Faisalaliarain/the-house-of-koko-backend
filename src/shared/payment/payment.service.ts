import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import Stripe from 'stripe';
import { Payment, PaymentDocument, PaymentStatus } from '../../entities/payment.entity';
import { Plan, PlanDocument } from '../../entities/plan.entity';
import { User, UserDocument } from '../../entities/user.entity';
import { Membership, MembershipDocument, MembershipStatus } from '../../entities/membership.entity';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  private stripe: Stripe;

  constructor(
    @InjectModel(Payment.name) private readonly paymentModel: Model<PaymentDocument>,
    @InjectModel(Plan.name) private readonly planModel: Model<PlanDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Membership.name) private readonly membershipModel: Model<MembershipDocument>,
  ) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-06-30.basil',
    });
  }

  /**
   * Create or get Stripe customer for user
   */
  private async getOrCreateStripeCustomer(user: UserDocument): Promise<string> {
    if (user.stripeCustomerId) {
      return user.stripeCustomerId;
    }

    // Create new Stripe customer
    const customer = await this.stripe.customers.create({
      email: user.email,
      name: user.name,
      metadata: {
        userId: user._id.toString(),
      },
    });

    // Update user with Stripe customer ID
    user.stripeCustomerId = customer.id;
    await user.save();

    this.logger.log(`Created Stripe customer ${customer.id} for user ${user._id}`);
    return customer.id;
  }

  /**
   * Create a payment intent for a plan
   */
  async createPaymentIntent(userId: string, planId: string): Promise<{
    paymentIntent: Stripe.PaymentIntent;
    clientSecret: string;
    paymentId: string;
  }> {
    try {
      // Validate user exists
      const user = await this.userModel.findById(userId).exec();
      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Validate plan exists
      const plan = await this.planModel.findById(planId).exec();
      if (!plan) {
        throw new NotFoundException('Plan not found');
      }

      // Get or create Stripe customer
      const stripeCustomerId = await this.getOrCreateStripeCustomer(user);

      // Check if user already has an active membership
      const existingMembership = await this.membershipModel.findOne({
        userId: new Types.ObjectId(userId),
        status: MembershipStatus.ACTIVE,
        endDate: { $gt: new Date() },
      }).exec();

      if (existingMembership) {
        throw new BadRequestException('User already has an active membership');
      }

      // Create Stripe payment intent
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(plan.price * 100), // Convert to cents
        currency: plan.currency.toLowerCase(),
        customer: stripeCustomerId,
        metadata: {
          userId,
          planId,
          planName: plan.name,
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });

      // Create payment record
      const payment = new this.paymentModel({
        userId: new Types.ObjectId(userId),
        planId: new Types.ObjectId(planId),
        amount: plan.price,
        currency: plan.currency,
        stripePaymentIntentId: paymentIntent.id,
        stripeClientSecret: paymentIntent.client_secret,
        status: PaymentStatus.PENDING,
        metadata: {
          planName: plan.name,
          planFeatures: plan.features,
        },
      });

      await payment.save();

      this.logger.log(`Payment intent created for user ${userId}, plan ${planId}`);

      return {
        paymentIntent,
        clientSecret: paymentIntent.client_secret,
        paymentId: payment._id.toString(),
      };
    } catch (error) {
      this.logger.error(`Failed to create payment intent: ${error.message}`);
      throw error;
    }
  }

  /**
   * Confirm payment and create membership
   */
  async confirmPayment(paymentId: string): Promise<{
    payment: PaymentDocument;
    membership: MembershipDocument;
  }> {
    try {
      const payment = await this.paymentModel.findById(paymentId).exec();
      if (!payment) {
        throw new NotFoundException('Payment not found');
      }

      if (payment.status !== PaymentStatus.PENDING) {
        throw new BadRequestException('Payment is not in pending status');
      }

      // Retrieve payment intent from Stripe
      const paymentIntent = await this.stripe.paymentIntents.retrieve(
        payment.stripePaymentIntentId,
      );

      if (paymentIntent.status === 'succeeded') {
        // Update payment status
        payment.status = PaymentStatus.SUCCEEDED;
        payment.paidAt = new Date();
        payment.stripeChargeId = paymentIntent.latest_charge as string;
        await payment.save();

        // Create membership
        const membership = await this.createMembership(payment);

        this.logger.log(`Payment confirmed and membership created for payment ${paymentId}`);

        return { payment, membership };
      } else if (paymentIntent.status === 'requires_payment_method') {
        payment.status = PaymentStatus.FAILED;
        payment.failureReason = 'Payment method required';
        payment.failedAt = new Date();
        await payment.save();

        throw new BadRequestException('Payment method required');
      } else {
        payment.status = PaymentStatus.FAILED;
        payment.failureReason = `Payment failed with status: ${paymentIntent.status}`;
        payment.failedAt = new Date();
        await payment.save();

        throw new BadRequestException(`Payment failed: ${paymentIntent.status}`);
      }
    } catch (error) {
      this.logger.error(`Failed to confirm payment: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create membership after successful payment
   */
  private async createMembership(payment: PaymentDocument): Promise<MembershipDocument> {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setFullYear(endDate.getFullYear() + 1); // 1 year membership

    const membership = new this.membershipModel({
      userId: payment.userId,
      planId: payment.planId,
      paymentId: payment._id,
      status: MembershipStatus.ACTIVE,
      startDate,
      endDate,
      autoRenew: false,
      metadata: {
        planName: payment.metadata?.planName,
        paymentAmount: payment.amount,
        paymentCurrency: payment.currency,
      },
    });

    return await membership.save();
  }

  /**
   * Get payment by ID
   */
  async getPaymentById(paymentId: string): Promise<PaymentDocument> {
    const payment = await this.paymentModel
      .findById(paymentId)
      .populate('userId', 'name email')
      .populate('planId', 'name price currency features')
      .exec();

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return payment;
  }

  /**
   * Get user's payment history
   */
  async getUserPayments(userId: string): Promise<PaymentDocument[]> {
    return await this.paymentModel
      .find({ userId: new Types.ObjectId(userId) })
      .populate('planId', 'name price currency features')
      .sort({ createdAt: -1 })
      .exec();
  }

  /**
   * Cancel payment
   */
  async cancelPayment(paymentId: string): Promise<PaymentDocument> {
    const payment = await this.paymentModel.findById(paymentId).exec();
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.status !== PaymentStatus.PENDING) {
      throw new BadRequestException('Only pending payments can be cancelled');
    }

    // Cancel payment intent in Stripe
    await this.stripe.paymentIntents.cancel(payment.stripePaymentIntentId);

    payment.status = PaymentStatus.CANCELED;
    await payment.save();

    this.logger.log(`Payment cancelled: ${paymentId}`);

    return payment;
  }

  /**
   * Process Stripe webhook
   */
  async processWebhook(event: Stripe.Event): Promise<void> {
    try {
      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
          break;
        case 'payment_intent.payment_failed':
          await this.handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
          break;
        default:
          this.logger.log(`Unhandled event type: ${event.type}`);
      }
    } catch (error) {
      this.logger.error(`Webhook processing failed: ${error.message}`);
      throw error;
    }
  }

  private async handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    const payment = await this.paymentModel.findOne({
      stripePaymentIntentId: paymentIntent.id,
    }).exec();

    if (payment && payment.status === PaymentStatus.PENDING) {
      payment.status = PaymentStatus.SUCCEEDED;
      payment.paidAt = new Date();
      payment.stripeChargeId = paymentIntent.latest_charge as string;
      await payment.save();

      // Create membership
      await this.createMembership(payment);

      this.logger.log(`Payment succeeded via webhook: ${payment._id}`);
    }
  }

  private async handlePaymentFailed(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    const payment = await this.paymentModel.findOne({
      stripePaymentIntentId: paymentIntent.id,
    }).exec();

    if (payment && payment.status === PaymentStatus.PENDING) {
      payment.status = PaymentStatus.FAILED;
      payment.failureReason = 'Payment failed';
      payment.failedAt = new Date();
      await payment.save();

      this.logger.log(`Payment failed via webhook: ${payment._id}`);
    }
  }
}