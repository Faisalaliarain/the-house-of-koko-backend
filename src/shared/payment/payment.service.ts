import { Injectable, BadRequestException } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class PaymentService {
  private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2022-11-15',
    });
  }

  async createPaymentIntent(amount: number, currency: string, customerId?: string) {
    try {
      return await this.stripe.paymentIntents.create({
        amount,
        currency,
        customer: customerId,
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async createCustomer(email: string) {
    return await this.stripe.customers.create({ email });
  }

  async saveCard(customerId: string, paymentMethodId: string) {
    return await this.stripe.paymentMethods.attach(paymentMethodId, { customer: customerId });
  }

  async subscribeToPlan(customerId: string, priceId: string) {
    return await this.stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent'],
    });
  }
}
