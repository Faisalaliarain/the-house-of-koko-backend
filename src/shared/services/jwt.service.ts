import { Injectable } from '@nestjs/common';
import { sign, verify, decode, SignOptions, JwtPayload } from 'jsonwebtoken';

@Injectable()
export class JwtService {
  private readonly jwtSecret: string;

  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
  }

  sign(payload: string | object | Buffer): string {
    // Use number for expiresIn (seconds) - 7 days = 604800 seconds
    const expiresIn = parseInt(process.env.JWT_EXPIRY_SECONDS || '604800', 10);
    const options: SignOptions = {
      expiresIn
    };
    return sign(payload, this.jwtSecret, options);
  }

  verify(token: string): string | JwtPayload {
    try {
      return verify(token, this.jwtSecret);
    } catch {
      throw new Error('Invalid token');
    }
  }

  decode(token: string): string | JwtPayload | null {
    return decode(token);
  }
}
