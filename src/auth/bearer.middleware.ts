// bearer.middleware.ts

import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';
import CustomRequest from './request.interface';

@Injectable()
export class BearerMiddleware implements NestMiddleware {
    constructor(private readonly jwtService: JwtService) {}

    async use(req: CustomRequest, res: Response, next: NextFunction) {
        const authHeader = req.headers['authorization'];
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new UnauthorizedException('Bearer token not found');
        }
        const token = authHeader.split(' ')[1];
        console.log(token)
        try {
            // const decoded = this.jwtService.verify(token);
            // req.user = decoded;
            next();
        } catch (error) {
            throw new UnauthorizedException('Invalid token1');
        }
    }
}
