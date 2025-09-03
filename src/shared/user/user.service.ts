import {BadRequestException, Injectable, NotFoundException} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {User, UserDocument } from '../../entities/user.entity';
import { UserRole } from '../../utils/enums/roles.enum';
import { getUserbyIdDTO, UpdateProgressDto } from './user.dto';
import { AuthenticatedRequest } from '../../utils/interfaces/authenticated-request.interface';  
import {AwsSesService} from "../aws-ses/aws-ses-service";
import {RbacRoleMachineName} from "../../utils/enums/rbac.enum";
import {RBAC_ROLES, RoleMachineNameMap} from "../rbac/rbac-roles.config";
import { S3Service } from '../services/s3.service';

// Extend service with onboarding progress update
export interface ProgressResult { message: string; data: Partial<User>; }

// Add progress update method to the service
export type OnboardingStep = 'registered' | 'otp_verified' | 'plan_selected' | '=' | 'onboarding_completed';

@Injectable()
export class UserService {
    constructor(
      @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
      private readonly s3Service: S3Service,
      private readonly awsSesService: AwsSesService
    ) {}
    getPermissionsByRole(role: RbacRoleMachineName): string[] {
        const matched = RBAC_ROLES.find(r => r.machineName === role);
        return matched?.permissions || [];
    }
    async getLoggedInUser(req: AuthenticatedRequest) {
        const user = req.user;
        const dbUser = await this.userModel.findOne({_id: user.userId, isBlocked: false}).exec();
        if (!dbUser) {
            return {status: 404, message: 'User not found', data: null};
        }
        const userObj = dbUser.toObject();
        const role = userObj.role;
        const mappedRoleMachineName = RoleMachineNameMap[role]; // e.g., 'lp' -> 'SOX_BASE_LP'
        const rolePermissions = RBAC_ROLES.find(r => r.machineName === mappedRoleMachineName)?.permissions ?? [];

        const permissionsMap = Object.fromEntries(rolePermissions.map(p => [p, true]));
        // const flatPermissionsArray = this.getPermissionsByRole(role);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...userWithoutPassword } = userObj;
        const profileImage = userObj.profileImage;
        // return signed url
        if (profileImage) {
            const bucketName = process.env.AWS_S3_BUCKET_NAME || 'project-name-events-bucket';
            const signedUrl = await this.s3Service.getPresignedUrl(bucketName, profileImage, 3600);
            userWithoutPassword.profileImage = signedUrl;
        }
        return {status: 200, message: 'success', data: {...userWithoutPassword,  permissions: permissionsMap}}
    }

    async getUserbyId(args: getUserbyIdDTO){
        const {id} = args
        const userToFind = await this.userModel.findOne({_id: id}).exec();
        if (!userToFind) {
            return {status: 404, message: 'User not found', data: null};
        }
        const userObj = userToFind.toObject();
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const {password, ...userWithoutPassword} = userObj;
        return {status: 200, message:'success', data: {...userWithoutPassword}}
    }
    async findByEmail(email: string) {
        return this.userModel.findOne({ email }).exec();
    }

    async findById(id: string) {
        return this.userModel.findById(id).exec();
    }

    async createAdmin(data: Partial<User>) {
        const admin = new this.userModel({
            ...data,
            role: UserRole.ADMIN,
            isVerified: true,
            isApproved: true,
            isBlocked: false,
            isActive: true,
        });
        return admin.save();
    }

    async createUser(data: Partial<User>) {
        // Set default role if not provided
        const userData = {
            ...data,
            role: data.role || UserRole.GUEST, // Default to GUEST role
        };
        const user = new this.userModel(userData);
        return user.save();
    }

    async rejectUser(id: string) {
        const user = await this.userModel.findById(id);
        if (!user) throw new NotFoundException('User not found');

        if (user.isApproved) {
            throw new BadRequestException('User is already approved');
        }

        user.isApproved = false;
        user.rejectedAt = new Date();
        // user.rejectionReason = reason || 'Not specified';
        await user.save();

        // Send rejection email
        await this.awsSesService.sendEmailWithTemplate(
          [user.email],
          'Your Profile Was Rejected',
          'profile-rejected', // template filename without .hbs
          {
              name: user.name, // optionally customize,
              reason: 'We couldn’t approve your profile at this time.',
              supportEmail: 'support@project-name.io', // optionally customize
          }
        );

        return { message: 'User rejected and notified via email' };
    }

    async Users() {
        const users = await this.userModel.find({
            role: { $in: [UserRole.USER] },
            rejectedAt: { $exists: false }, // ✅ now correctly placed
        }).select('-password').lean();

        return { message: 'User approved successfully', users };
    }
    async deleteUser(userId: string) {
        return this.userModel.findByIdAndDelete(userId);
    }
  
    async findByReferralCode(code: string): Promise<UserDocument | null> {
        return this.userModel.findOne({ referralCode: code }); // ✅ Don't use `.lean()`
    }

    async generateInviteLink(referralCode: string) {
        return `https://yourapp.com/signup?ref=${referralCode}`;
    }

    async updateGoogleCredentials(userId: string, credentials: {
        accessToken?: string;
        refreshToken?: string;
        expiryDate?: number;
    }) {
        const updateData: Partial<User> = {};
        
        if (credentials.accessToken) {
            updateData.googleAccessToken = credentials.accessToken;
        }
        
        if (credentials.refreshToken) {
            updateData.googleRefreshToken = credentials.refreshToken;
        }
        
        if (credentials.expiryDate) {
            updateData.googleTokenExpiry = new Date(credentials.expiryDate);
        }

        const user = await this.userModel.findByIdAndUpdate(
            userId,
            updateData,
            { new: true }
        ).exec();

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return user;
    }

    async getGoogleCredentials(userId: string) {
        const user = await this.userModel.findById(userId)
            .select('googleAccessToken googleRefreshToken googleTokenExpiry')
            .exec();
        
        if (!user) {
            throw new NotFoundException('User not found');
        }

        return {
            accessToken: user.googleAccessToken,
            refreshToken: user.googleRefreshToken,
            tokenExpiry: user.googleTokenExpiry
        };
    }

    /**
     * Save Zoom tokens for user (used by ZoomService)
    */
    async saveZoomTokens(userId: string, tokens: {
        access_token: string;
        refresh_token: string;
        expires_at: number;  // timestamp in ms
    } | null): Promise<void> {
        if (tokens === null) {
            // Remove Zoom tokens (revoke)
            await this.userModel.findByIdAndUpdate(userId, {
                $unset: {
                    zoomAccessToken: "",
                    zoomRefreshToken: "",
                    zoomTokenExpiry: "",
                }
            }).exec();
            return;
        }
        await this.userModel.findByIdAndUpdate(userId, {
            zoomAccessToken: tokens.access_token,
            zoomRefreshToken: tokens.refresh_token,
            zoomTokenExpiry: new Date(tokens.expires_at),
        }).exec();
    }

    /**
     * Get Zoom tokens for user (used by ZoomService)
    */
    async getZoomTokens(userId: string): Promise<{
        access_token: string;
        refresh_token: string;
        expires_at: number;
    } | null> {
        const user = await this.userModel.findById(userId)
            .select('zoomAccessToken zoomRefreshToken zoomTokenExpiry')
            .exec();

        if (!user || !user.zoomAccessToken || !user.zoomRefreshToken || !user.zoomTokenExpiry) {
            return null;
        }
        return {
            access_token: user.zoomAccessToken,
            refresh_token: user.zoomRefreshToken,
            expires_at: user.zoomTokenExpiry.getTime(),
        };
    }

    async updateProgress(userId: string, dto: UpdateProgressDto): Promise<ProgressResult> {
        const user = await this.userModel.findById(userId);
        if (!user) throw new NotFoundException('User not found');

        if (dto.onboardingStep) (user as any).onboardingStep = dto.onboardingStep as OnboardingStep;
        if (typeof dto.hasPurchasedPlan === 'boolean') (user as any).hasPurchasedPlan = dto.hasPurchasedPlan;
        if (typeof dto.hasCompletedOnboarding === 'boolean') (user as any).hasCompletedOnboarding = dto.hasCompletedOnboarding;
        if (typeof dto.hasCompletedPayment === 'boolean') (user as any).hasCompletedPayment = dto.hasCompletedPayment;
        if (typeof dto.hasSelectedInterests === 'boolean') (user as any).hasSelectedInterests = dto.hasSelectedInterests;
        if (dto.selectedPlanId) (user as any).selectedPlanId = dto.selectedPlanId;

        await user.save();
        const { password, ...rest } = user.toObject();
        return { message: 'Progress updated', data: rest };
    }
}