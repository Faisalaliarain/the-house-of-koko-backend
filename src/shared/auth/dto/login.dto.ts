// src/auth/dto/login.dto.ts
import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GenericResponseDto {
  @ApiProperty({ example: 'Success message here' })
  message: string;
}

export class LoginResponseDto {
  @ApiProperty()
  access_token: string;

  @ApiProperty({
    example: {
      id: '64d8371f29...',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'lp',
    },
  })
  user: any;
}

export class LoginDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail({}, { message: 'Email must be a valid email address' })
  email: string;

  @ApiProperty({ example: 'StrongP@ssw0rd' })
  @IsNotEmpty({ message: 'Password is required' })
  password: string;
}

