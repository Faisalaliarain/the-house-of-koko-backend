import { Controller, Post, Req, Res, Logger, RawBodyRequest } from '@nestjs/common';
import { Request, Response } from 'express';
import Stripe from 'stripe';
import { PaymentService } from './payment.service';

@Controller('webhook')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);
  private stripe: Stripe;

  constructor(private readonly paymentService: PaymentService) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2025-06-30.basil',
    });
  }

  @Post('stripe')
  async handleStripeWebhook(@Req() req: RawBodyRequest<Request>, @Res() res: Response) {
    const sig = req.headers['stripe-signature'] as string;
    const payload = req.body;
    let event: Stripe.Event;

    this.logger.log('Received webhook request');

    if (!sig || !payload) {
      this.logger.error('Missing signature or payload');
      return res.status(400).send('Missing signature or payload');
    }

    try {
      // Verify webhook signature
      event = this.stripe.webhooks.constructEvent(
        payload,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err) {
      this.logger.error(`Webhook signature verification failed: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    this.logger.log(`Received webhook event: ${event.type}`);

    try {
      // Process the webhook event
      await this.paymentService.processWebhook(event);
      res.json({ received: true });
    } catch (error) {
      this.logger.error(`Webhook processing failed: ${error.message}`);
      res.status(500).json({ error: 'Webhook processing failed' });
    }
  }
}
