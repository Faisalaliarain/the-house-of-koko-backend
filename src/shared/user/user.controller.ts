import {Controller, Get, Req, Param, Post, Body} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiOperation,
    ApiTags,
    ApiParam,
    ApiResponse,
} from '@nestjs/swagger';
import { Policy } from '../decorators/policy.decorator';
import { UserService } from './user.service';
import { getUserbyIdDTO, UserResponseDto, UpdateProgressDto } from './user.dto';
import {UserPermissions, RbacEntities, EntityPath, ProgressPermissions} from '../../utils/enums/rbac.enum';
import { AuthenticatedRequest } from '../../utils/interfaces/authenticated-request.interface';

@ApiTags('User')
@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @ApiOperation({ summary: 'Get currently logged-in user' })
    @ApiBearerAuth('bearer')
    @Policy({
        permission: UserPermissions.VIEW_PROFILE,
        type: RbacEntities.USER,
        checkOwnership: false
    })
    @Get()
    @ApiResponse({
        status: 200,
        description: 'Returns the currently logged-in user',
        type: UserResponseDto,
    })
    async getLoggedInUser(@Req() req: AuthenticatedRequest) {


        return await this.userService.getLoggedInUser(req)
    }

    @Get('progress')
    @ApiOperation({ summary: 'Get onboarding/progress for current user' })
    @ApiBearerAuth('bearer')
    @Policy({
      permission: ProgressPermissions.VIEW_OWN,
      type: RbacEntities.USER,
      checkOwnership: false,
    })
    async getProgress(@Req() req: AuthenticatedRequest) {
      const res = await this.userService.getLoggedInUser(req);
      console.log("res",res)
      // Return only progress fields
      const data = res?.data || {} as any;
      const progress = {
        onboardingStep: data.onboardingStep,
        hasPurchasedPlan: data.hasPurchasedPlan,
        hasCompletedOnboarding: data.hasCompletedOnboarding,
        hasCompletedPayment: data.hasCompletedPayment || data.hasPurchasedPlan, // Map to new field
        hasSelectedInterests: data.hasSelectedInterests,
        selectedPlanId: data.selectedPlanId,
      };
      return { message: 'OK', data: progress };
    }
  
    @Post('progress')
    @ApiOperation({ summary: 'Update onboarding/progress for current user' })
    @ApiBearerAuth('bearer')
    @Policy({
      permission: ProgressPermissions.UPDATE_OWN,
      type: RbacEntities.USER,
      checkOwnership: false,
    })
    async updateProgress(@Req() req: AuthenticatedRequest, @Body() dto: UpdateProgressDto) {
      const userId = req.user?.userId;
      return this.userService.updateProgress(userId as string, dto);
    }

    @ApiOperation({ summary: 'Get user by ID' })
    @ApiBearerAuth('bearer')
    @Policy({
        permission: UserPermissions.VIEW_ONE,
        type: RbacEntities.USER,
        path: EntityPath.PATH_PARAM_ID,
        checkOwnership: true
    })
    @Get(':id')
    @ApiParam({ name: 'id', description: 'User ID' })
    @ApiResponse({
        status: 200,
        description: 'Returns the user by ID',
        type: UserResponseDto,
    })
    async getUserbyId(@Param() args: getUserbyIdDTO) {
        return await this.userService.getUserbyId(args);
    }

    @Post('/:id/reject')
    @ApiOperation({ summary: 'Approve a user (Admin only)' })
    @ApiBearerAuth('bearer')
    @Policy({
        permission: UserPermissions.APPROVE,
        type: RbacEntities.USER,
        path: EntityPath.PATH_PARAM_ID,
        checkOwnership: false
    })
    @ApiParam({ name: 'id', description: 'User ID to approve' })
    @ApiResponse({
        status: 200,
        description: 'User approved successfully',
        type: UserResponseDto,
    })
    async rejectUser(@Param('id') id: string) {
        return this.userService.rejectUser(id);
    }

    @Post('/:id/delete')
    @ApiOperation({ summary: 'Delete a user (Admin only)' })
    @ApiBearerAuth('bearer')
    @Policy({
        permission: UserPermissions.DELETE,
        type: RbacEntities.USER,
        path: EntityPath.PATH_PARAM_ID,
        checkOwnership: false
    })
    @ApiParam({ name: 'id', description: 'User ID to approve' })
    @ApiResponse({
        status: 200,
        description: 'User approved successfully',
        type: UserResponseDto,
    })
  async deleteUser(@Param('id') id: string) {
      return this.userService.deleteUser(id);
  }

    @Post('/user-requests')
    @ApiOperation({ summary: 'Get all pending users (Admin only)' })
    @ApiBearerAuth('bearer')
    @Policy({
        permission: UserPermissions.VIEW_ALL,
        type: RbacEntities.USER,
        checkOwnership: false
    })
    @ApiResponse({
        status: 200,
        description: 'List of users awaiting admin approval',
        type: [UserResponseDto],
    })
  async getUsers() {
      return this.userService.Users();
  }




}
