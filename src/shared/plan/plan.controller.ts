import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PlanService } from './plan.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@ApiTags('Plans')
@Controller('plans')
export class PlanController {
  constructor(private readonly planService: PlanService) {}

  @Get()
  @ApiOperation({ summary: 'Get all available plans' })
  @ApiResponse({ status: 200, description: 'Plans retrieved successfully' })
  async getAllPlans() {
    const plans = await this.planService.findAll();
    
    return {
      success: true,
      message: 'Plans retrieved successfully',
      data: plans.map(plan => ({
        id: plan._id,
        name: plan.name,
        description: plan.description,
        features: plan.features,
        price: plan.price,
        currency: plan.currency,
        stripeProductId: plan.stripeProductId,
        stripePriceId: plan.stripePriceId,
        isActive: plan.isActive,
        createdAt: plan.createdAt,
        updatedAt: plan.updatedAt,
      })),
    };
  }
}
