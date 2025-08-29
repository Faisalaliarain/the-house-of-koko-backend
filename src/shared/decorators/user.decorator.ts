import { createParamDecorator, ExecutionContext } from '@nestjs/common'

export const User = createParamDecorator((data: string, ctx: ExecutionContext) => {
	const request = ctx.switchToHttp().getRequest()
	const user = request.user
	
	if (!user) {
		return undefined
	}
	
	// If a specific property is requested, return that property
	if (data) {
		// Handle common property mappings
		if (data === 'userId') {
			return user._id?.toString() || user.id?.toString() || user.userId
		}
		return user[data]
	}
	
	// If no specific property requested, return the whole user object
	return user
})
