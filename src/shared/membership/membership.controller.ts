import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { MembershipService } from './membership.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import {
  MembershipStatusResponseDto,
  MembershipResponseDto,
  CancelMembershipDto,
  SuspendMembershipDto,
  ExtendMembershipDto,
} from './dto/membership.dto';
import { Types } from 'mongoose';

// Type definitions for populated documents
interface PopulatedPlan {
  _id: Types.ObjectId;
  name: string;
  price: number;
  currency: string;
  features: string[];
}

interface PopulatedPayment {
  _id: Types.ObjectId;
  amount: number;
  currency: string;
  paidAt: Date;
}

interface PopulatedUser {
  _id: Types.ObjectId;
  name: string;
  email: string;
}

interface PopulatedMembership {
  _id: Types.ObjectId;
  userId: PopulatedUser | Types.ObjectId;
  planId: PopulatedPlan | Types.ObjectId;
  paymentId: PopulatedPayment | Types.ObjectId;
  status: string;
  startDate: Date;
  endDate: Date;
  cancelledAt?: Date;
  cancellationReason?: string;
  suspendedAt?: Date;
  suspensionReason?: string;
  reactivatedAt?: Date;
  autoRenew: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

@ApiTags('Memberships')
@Controller('memberships')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MembershipController {
  constructor(private readonly membershipService: MembershipService) {}

  // Helper function to check if a field is populated
  private isPopulated<T>(field: T | Types.ObjectId): field is T {
    return field && typeof field === 'object' && '_id' in field;
  }

  // Helper function to safely get plan data
  private getPlanData(planId: PopulatedPlan | Types.ObjectId) {
    if (this.isPopulated(planId)) {
      return {
        id: planId._id.toString(),
        name: planId.name,
        price: planId.price,
        currency: planId.currency,
        features: planId.features,
      };
    }
    return null;
  }

  // Helper function to safely get payment data
  private getPaymentData(paymentId: PopulatedPayment | Types.ObjectId) {
    if (this.isPopulated(paymentId)) {
      return {
        id: paymentId._id.toString(),
        amount: paymentId.amount,
        currency: paymentId.currency,
        paidAt: paymentId.paidAt,
      };
    }
    return null;
  }

  // Helper function to safely get user data
  private getUserData(userId: PopulatedUser | Types.ObjectId) {
    if (this.isPopulated(userId)) {
      return {
        id: userId._id.toString(),
        name: userId.name,
        email: userId.email,
      };
    }
    return null;
  }

  @Get('status')
  @ApiOperation({ summary: 'Get user membership status' })
  @ApiResponse({ status: 200, description: 'Membership status retrieved successfully', type: MembershipStatusResponseDto })
  async getMembershipStatus(@Request() req: any) {
    const userId = req.user.userId;
    const status = await this.membershipService.getMembershipStatus(userId);
    
    const currentMembership = status.currentMembership as PopulatedMembership;
    const planData = currentMembership ? this.getPlanData(currentMembership.planId) : null;
    
    return {
      success: true,
      message: 'Membership status retrieved successfully',
      data: {
        hasActiveMembership: status.hasActiveMembership,
        currentMembership: currentMembership && planData ? {
          id: currentMembership._id.toString(),
          plan: planData,
          startDate: currentMembership.startDate,
          endDate: currentMembership.endDate,
          status: currentMembership.status,
        } : null,
        expiresAt: status.expiresAt,
        daysRemaining: status.daysRemaining,
      },
    };
  }

  @Get('current')
  @ApiOperation({ summary: 'Get user current active membership' })
  @ApiResponse({ status: 200, description: 'Current membership retrieved successfully', type: MembershipResponseDto })
  @ApiResponse({ status: 404, description: 'No active membership found' })
  async getCurrentMembership(@Request() req: any) {
    const userId = req.user.userId;
    const membership = await this.membershipService.getCurrentMembership(userId);
    
    if (!membership) {
      return {
        success: false,
        message: 'No active membership found',
        data: null,
      };
    }

    const populatedMembership = membership as PopulatedMembership;
    const planData = this.getPlanData(populatedMembership.planId);
    const paymentData = this.getPaymentData(populatedMembership.paymentId);
    const userData = this.getUserData(populatedMembership.userId);

    return {
      success: true,
      message: 'Current membership retrieved successfully',
      data: {
        id: populatedMembership._id.toString(),
        userId: userData?.id || populatedMembership.userId.toString(),
        plan: planData,
        payment: paymentData,
        status: populatedMembership.status,
        startDate: populatedMembership.startDate,
        endDate: populatedMembership.endDate,
        cancelledAt: populatedMembership.cancelledAt,
        cancellationReason: populatedMembership.cancellationReason,
        suspendedAt: populatedMembership.suspendedAt,
        suspensionReason: populatedMembership.suspensionReason,
        reactivatedAt: populatedMembership.reactivatedAt,
        autoRenew: populatedMembership.autoRenew,
        createdAt: populatedMembership.createdAt,
        updatedAt: populatedMembership.updatedAt,
      },
    };
  }

  @Get('history')
  @ApiOperation({ summary: 'Get user membership history' })
  @ApiResponse({ status: 200, description: 'Membership history retrieved successfully', type: [MembershipResponseDto] })
  async getMembershipHistory(@Request() req: any) {
    const userId = req.user.userId;
    const memberships = await this.membershipService.getUserMemberships(userId);
    
    return {
      success: true,
      message: 'Membership history retrieved successfully',
      data: memberships.map(membership => {
        const populatedMembership = membership as PopulatedMembership;
        const planData = this.getPlanData(populatedMembership.planId);
        const paymentData = this.getPaymentData(populatedMembership.paymentId);
        const userData = this.getUserData(populatedMembership.userId);

        return {
          id: populatedMembership._id.toString(),
          userId: userData?.id || populatedMembership.userId.toString(),
          plan: planData,
          payment: paymentData,
          status: populatedMembership.status,
          startDate: populatedMembership.startDate,
          endDate: populatedMembership.endDate,
          cancelledAt: populatedMembership.cancelledAt,
          cancellationReason: populatedMembership.cancellationReason,
          suspendedAt: populatedMembership.suspendedAt,
          suspensionReason: populatedMembership.suspensionReason,
          reactivatedAt: populatedMembership.reactivatedAt,
          autoRenew: populatedMembership.autoRenew,
          createdAt: populatedMembership.createdAt,
          updatedAt: populatedMembership.updatedAt,
        };
      }),
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get membership by ID' })
  @ApiResponse({ status: 200, description: 'Membership retrieved successfully', type: MembershipResponseDto })
  @ApiResponse({ status: 404, description: 'Membership not found' })
  async getMembershipById(@Param('id') id: string) {
    const membership = await this.membershipService.getMembershipById(id);
    
    const populatedMembership = membership as PopulatedMembership;
    const planData = this.getPlanData(populatedMembership.planId);
    const paymentData = this.getPaymentData(populatedMembership.paymentId);
    const userData = this.getUserData(populatedMembership.userId);

    return {
      success: true,
      message: 'Membership retrieved successfully',
      data: {
        id: populatedMembership._id.toString(),
        userId: userData?.id || populatedMembership.userId.toString(),
        plan: planData,
        payment: paymentData,
        status: populatedMembership.status,
        startDate: populatedMembership.startDate,
        endDate: populatedMembership.endDate,
        cancelledAt: populatedMembership.cancelledAt,
        cancellationReason: populatedMembership.cancellationReason,
        suspendedAt: populatedMembership.suspendedAt,
        suspensionReason: populatedMembership.suspensionReason,
        reactivatedAt: populatedMembership.reactivatedAt,
        autoRenew: populatedMembership.autoRenew,
        createdAt: populatedMembership.createdAt,
        updatedAt: populatedMembership.updatedAt,
      },
    };
  }

  @Post('cancel')
  @ApiOperation({ summary: 'Cancel membership' })
  @ApiResponse({ status: 200, description: 'Membership cancelled successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Membership not found' })
  @HttpCode(HttpStatus.OK)
  async cancelMembership(@Body() cancelMembershipDto: CancelMembershipDto) {
    const membership = await this.membershipService.cancelMembership(
      cancelMembershipDto.membershipId,
      cancelMembershipDto.reason,
    );
    
    return {
      success: true,
      message: 'Membership cancelled successfully',
      data: {
        id: membership._id.toString(),
        status: membership.status,
        cancelledAt: membership.cancelledAt,
        cancellationReason: membership.cancellationReason,
      },
    };
  }

  @Post('suspend')
  @ApiOperation({ summary: 'Suspend membership' })
  @ApiResponse({ status: 200, description: 'Membership suspended successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Membership not found' })
  @HttpCode(HttpStatus.OK)
  async suspendMembership(@Body() suspendMembershipDto: SuspendMembershipDto) {
    const membership = await this.membershipService.suspendMembership(
      suspendMembershipDto.membershipId,
      suspendMembershipDto.reason,
    );
    
    return {
      success: true,
      message: 'Membership suspended successfully',
      data: {
        id: membership._id.toString(),
        status: membership.status,
        suspendedAt: membership.suspendedAt,
        suspensionReason: membership.suspensionReason,
      },
    };
  }

  @Post('reactivate')
  @ApiOperation({ summary: 'Reactivate suspended membership' })
  @ApiResponse({ status: 200, description: 'Membership reactivated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Membership not found' })
  @HttpCode(HttpStatus.OK)
  async reactivateMembership(@Body() body: { membershipId: string }) {
    const membership = await this.membershipService.reactivateMembership(body.membershipId);
    
    return {
      success: true,
      message: 'Membership reactivated successfully',
      data: {
        id: membership._id.toString(),
        status: membership.status,
        reactivatedAt: membership.reactivatedAt,
      },
    };
  }

  @Post('extend')
  @ApiOperation({ summary: 'Extend membership' })
  @ApiResponse({ status: 200, description: 'Membership extended successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Membership not found' })
  @HttpCode(HttpStatus.OK)
  async extendMembership(@Body() extendMembershipDto: ExtendMembershipDto) {
    const membership = await this.membershipService.extendMembership(
      extendMembershipDto.membershipId,
      extendMembershipDto.days,
    );
    
    return {
      success: true,
      message: 'Membership extended successfully',
      data: {
        id: membership._id.toString(),
        endDate: membership.endDate,
      },
    };
  }
}
