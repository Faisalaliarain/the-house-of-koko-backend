import { Injectable, Logger } from '@nestjs/common'
import { ERRORS } from '../../utils/enums/errors.enum'
import { ExceptionService } from './exception.service'

@Injectable()
export class SharedService {
	private readonly logger = new Logger(SharedService.name)
	constructor(private readonly exceptionService: ExceptionService) {}
	/**
	 * @param error error
	 * @param funName function name from error is thrown
	 * @author Faisal Ali
	 */
	sendError(error: any, funName: string) {
		console.log(`Error in ${funName}: `, error);
		this.logger.error(`Error in ${funName}: `, error, funName);
	
		const errorCode = error.code || '500';
		const errorMessage = error.message || 'Internal Server Error';
		const errorDetails = error.detail || 'An unexpected error occurred. Please try again later.';
	
		if (errorCode && errorMessage && errorDetails) {
			// Handle different error codes or statuses accordingly
			switch (errorCode) {
				case '400' :
					this.exceptionService.sendBadRequestException(errorMessage, errorDetails);
					break;
				case '404':
					this.exceptionService.sendNotFoundException(errorMessage, errorDetails);
					break;
				case '23505':
					this.exceptionService.sendConflictException(errorMessage, errorDetails);
					break;
				case '409':
						this.exceptionService.sendConflictException(errorMessage, errorDetails);
						break;
				default:
					// For any other error code, use internal server error as a fallback
					this.exceptionService.sendInternalServerErrorException(`${errorMessage}: ${errorDetails}`);
					break;
			}
		} else {
			// Send a generic internal server error
			this.exceptionService.sendInternalServerErrorException(ERRORS.SERVER_TEMPORY_DOWN);
		}
	
		throw error; // Optionally re-throw the error if further handling is needed elsewhere
	}
	
	

	/**
	 * @description send response
	 * @param message reponse message
	 * @param data response data
	 * @returns response messgae with payload
	 * @author Faisal Ali
	 */
	sendResponse(message: string, data: any = {}, count?) {
		return { message, data, status: 200, count }
	}
	/**
	 * @description send response
	 * @param message reponse message
	 * @param data response data
	 * @returns response messgae with payload
	 * @author Faisal Ali
	 */
	sendResponseWithStatus(message: string, status?, data: any = {}, count?) {
		return { message, data, status, count }
	}
	sendPaginatedResponse(message: string, data: any = {}, count) {
		return { message, data, status: 200, count }
	}
}
