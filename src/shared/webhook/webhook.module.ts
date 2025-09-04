import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Payment, PaymentSchema } from '../../entities/payment.entity';
import { Plan, PlanSchema } from '../../entities/plan.entity';
import { User, UserSchema } from '../../entities/user.entity';
import { Membership, MembershipSchema } from '../../entities/membership.entity';
import { PaymentService } from '../payment/payment.service';
import { WebhookController } from '../payment/webhook.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Payment.name, schema: PaymentSchema },
      { name: Plan.name, schema: PlanSchema },
      { name: User.name, schema: UserSchema },
      { name: Membership.name, schema: MembershipSchema },
    ]),
  ],
  controllers: [WebhookController],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class WebhookModule {}
