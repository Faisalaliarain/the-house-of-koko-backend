import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class OriginMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const allowedOrigins = ['*'];  // Your React app domain

    const origin = req.headers.origin || req.headers.referer;

    if (allowedOrigins.includes(origin)) {
      next();
    } else {
      throw new UnauthorizedException('Access Denied');
    }
  }
}
