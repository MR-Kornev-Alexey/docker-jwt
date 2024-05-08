import { NestMiddleware } from '@nestjs/common';
import { Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';
import CustomRequest from './request.interface';
export declare class BearerMiddleware implements NestMiddleware {
    private readonly jwtService;
    constructor(jwtService: JwtService);
    use(req: CustomRequest, res: Response, next: NextFunction): Promise<void>;
}
