import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  RawBodyRequest,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentService } from './payment.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import {
  CreatePaymentIntentDto,
  ConfirmPaymentDto,
  CancelPaymentDto,
  PaymentResponseDto,
  PaymentHistoryResponseDto,
} from './dto/payment.dto';

@ApiTags('Payments')
@Controller('payments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('create-intent')
  @ApiOperation({ summary: 'Create payment intent for a plan' })
  @ApiResponse({ status: 201, description: 'Payment intent created successfully', type: PaymentResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Plan not found' })
  async createPaymentIntent(
    @Request() req: any,
    @Body() createPaymentIntentDto: CreatePaymentIntentDto,
  ) {
    const userId = req.user.userId;
    const result = await this.paymentService.createPaymentIntent(userId, createPaymentIntentDto.planId);
    
    return {
      success: true,
      message: 'Payment intent created successfully',
      data: {
        paymentId: result.paymentId,
        clientSecret: result.clientSecret,
        amount: result.paymentIntent.amount,
        currency: result.paymentIntent.currency,
      },
    };
  }

  @Post('confirm')
  @ApiOperation({ summary: 'Confirm payment and create membership' })
  @ApiResponse({ status: 200, description: 'Payment confirmed successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  @HttpCode(HttpStatus.OK)
  async confirmPayment(@Body() confirmPaymentDto: ConfirmPaymentDto) {
    const result = await this.paymentService.confirmPayment(confirmPaymentDto.paymentId);
    
    return {
      success: true,
      message: 'Payment confirmed and membership created successfully',
      data: {
        payment: {
          id: result.payment._id,
          status: result.payment.status,
          amount: result.payment.amount,
          currency: result.payment.currency,
          paidAt: result.payment.paidAt,
        },
        membership: {
          id: result.membership._id,
          status: result.membership.status,
          startDate: result.membership.startDate,
          endDate: result.membership.endDate,
        },
      },
    };
  }

  @Post('cancel')
  @ApiOperation({ summary: 'Cancel a pending payment' })
  @ApiResponse({ status: 200, description: 'Payment cancelled successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  @HttpCode(HttpStatus.OK)
  async cancelPayment(@Body() cancelPaymentDto: CancelPaymentDto) {
    const payment = await this.paymentService.cancelPayment(cancelPaymentDto.paymentId);
    
    return {
      success: true,
      message: 'Payment cancelled successfully',
      data: {
        id: payment._id,
        status: payment.status,
      },
    };
  }

  @Get('history')
  @ApiOperation({ summary: 'Get user payment history' })
  @ApiResponse({ status: 200, description: 'Payment history retrieved successfully', type: [PaymentHistoryResponseDto] })
  async getPaymentHistory(@Request() req: any) {
    const userId = req.user.userId;
    const payments = await this.paymentService.getUserPayments(userId);
    
    return {
      success: true,
      message: 'Payment history retrieved successfully',
      data: payments.map(payment => ({
        id: payment._id,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        plan: {
          id: (payment.planId as any)._id,
          name: (payment.planId as any).name,
          price: (payment.planId as any).price,
          currency: (payment.planId as any).currency,
          features: (payment.planId as any).features,
        },
        paidAt: payment.paidAt,
        failedAt: payment.failedAt,
        createdAt: payment.createdAt,
      })),
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get payment by ID' })
  @ApiResponse({ status: 200, description: 'Payment retrieved successfully', type: PaymentResponseDto })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async getPaymentById(@Param('id') id: string) {
    const payment = await this.paymentService.getPaymentById(id);
    
    return {
      success: true,
      message: 'Payment retrieved successfully',
      data: {
        id: payment._id,
        userId: (payment.userId as any)._id,
        planId: (payment.planId as any)._id,
        amount: payment.amount,
        currency: payment.currency,
        stripePaymentIntentId: payment.stripePaymentIntentId,
        status: payment.status,
        paymentMethod: payment.paymentMethod,
        failureReason: payment.failureReason,
        paidAt: payment.paidAt,
        failedAt: payment.failedAt,
        createdAt: (payment as any).createdAt,
        updatedAt: (payment as any).updatedAt,
      },
    };
  }

  @Post('webhook')
  @ApiOperation({ summary: 'Handle Stripe webhook events' })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  @HttpCode(HttpStatus.OK)
  async handleWebhook(@Req() req: RawBodyRequest<Request>) {
    const signature = req.headers['stripe-signature'] as string;
    const payload = req.rawBody;

    if (!signature || !payload) {
      throw new Error('Missing signature or payload');
    }

    // Verify webhook signature and process event
    // This would typically use Stripe's webhook signature verification
    // For now, we'll assume the event is already verified
    
    try {
      const event = JSON.parse(payload.toString());
      await this.paymentService.processWebhook(event);
      
      return { received: true };
    } catch (error) {
      console.error('Webhook processing failed:', error);
      throw error;
    }
  }
}