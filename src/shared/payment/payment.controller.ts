import { Controller, Post, Body } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { SaveCardDto } from './dto/save-card.dto';
import { SubscribeToPlanDto } from './dto/subscribe-to-plan.dto';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('intent')
  createPaymentIntent(@Body() dto: CreatePaymentIntentDto) {
    return this.paymentService.createPaymentIntent(dto.amount, dto.currency, dto.customerId);
  }

  @Post('customer')
  createCustomer(@Body() dto: CreateCustomerDto) {
    return this.paymentService.createCustomer(dto.email);
  }

  @Post('card')
  saveCard(@Body() dto: SaveCardDto) {
    return this.paymentService.saveCard(dto.customerId, dto.paymentMethodId);
  }

  @Post('subscribe')
  subscribeToPlan(@Body() dto: SubscribeToPlanDto) {
    return this.paymentService.subscribeToPlan(dto.customerId, dto.priceId);
  }
}
