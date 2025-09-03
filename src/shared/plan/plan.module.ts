import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Plan, PlanSchema } from '../../entities/plan.entity';
import { PlanService } from './plan.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Plan.name, schema: PlanSchema }]),
  ],
  providers: [PlanService],
  exports: [PlanService],
})
export class PlanModule {}
