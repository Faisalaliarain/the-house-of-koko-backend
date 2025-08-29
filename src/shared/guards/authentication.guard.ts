import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as jwt from 'jsonwebtoken'
import { User, UserDocument } from '../../entities/user.entity'
import { UserRole } from '../../utils/enums/roles.enum';


@Injectable()
export class AuthenticationGuard implements CanActivate {
	constructor(@InjectModel(User.name) private readonly userModel: Model<UserDocument>) { }
	async canActivate(context: ExecutionContext) {
		const req: any = context.switchToHttp().getRequest()

		// Checking if token exists
		if (!req.headers.authorization) {
			throw new UnauthorizedException()
		}
		try {
			const authToken = req.headers.authorization.replace('Bearer ', '')
			const decodedToken = jwt.verify(authToken, process.env.JWT_SECRET) as jwt.JwtPayload
			const user: UserDocument = await this.userModel.findById(decodedToken.sub).exec()

			if (!user) {
				throw new HttpException('User not found', HttpStatus.FORBIDDEN);
			}
			if(user.isBlocked) throw new UnauthorizedException('You have been blocked by admin')
			
			const userObj = user.toObject();
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const { password, ...userWithoutPassword } = userObj;
			
			// Ensure role is properly set - fallback to GUEST if not set
			if (!userWithoutPassword.role) {
				userWithoutPassword.role = UserRole.GUEST;
			}
			
			req.user = userWithoutPassword
			return true
		} catch (error) {
			console.log(error)
			throw new UnauthorizedException()
		}
	}
}
