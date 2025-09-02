import { Controller, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import Stripe from 'stripe';

@Controller('payment/webhook')
export class WebhookController {
  @Post()
  async handleStripeWebhook(@Req() req: Request, @Res() res: Response) {
    const sig = req.headers['stripe-signature'];
    let event: Stripe.Event;
    try {
      event = (new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2022-11-15' })).webhooks.constructEvent(
        req.body,
        sig as string,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    // Handle event types (e.g., payment_intent.succeeded, invoice.paid, etc.)
    switch (event.type) {
      case 'payment_intent.succeeded':
        // TODO: handle successful payment
        break;
      case 'invoice.paid':
        // TODO: handle successful subscription payment
        break;
      // Add more cases as needed
      default:
        break;
    }
    res.json({ received: true });
  }
}
