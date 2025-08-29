import {
	Injectable,
	NotAcceptableException,
	NotFoundException,
	InternalServerErrorException,
	ConflictException,
	UnprocessableEntityException,
	BadRequestException,
	ForbiddenException,
	UnauthorizedException,
} from '@nestjs/common'

@Injectable()
export class ExceptionService {
	sendNotAcceptableException(message: string, details?: string): never {
		throw new NotAcceptableException({ message, details });
	}

	sendNotFoundException(message: string, details?: string): never {
		throw new NotFoundException({ message, details });
	}

	sendInternalServerErrorException(message: string, details?: string): never {
		throw new InternalServerErrorException({ message, details });
	}

	sendConflictException(message: string, details?: string): never {
		throw new ConflictException({ message, details });
	}

	sendUnprocessableEntityException(message: string, details?: string): never {
		throw new UnprocessableEntityException({ message, details });
	}

	sendBadRequestException(message: string, details?: string): never {
		throw new BadRequestException({ message, details });
	}

	sendForbiddenException(message: string, details?: string): never {
		throw new ForbiddenException({ message, details });
	}

	sendUnauthorizedException(message: string, details?: string): never {
		throw new UnauthorizedException({ message, details });
	}
}
