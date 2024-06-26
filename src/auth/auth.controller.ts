import {Body, Controller, Get, HttpCode, Post, UseGuards, UsePipes, ValidationPipe} from '@nestjs/common';
import {ApiTags} from '@nestjs/swagger';
import {AuthService} from './auth.service';
import {LoginDto} from './dto/login.dto';
import {RegisterDto} from './dto/register.dto';
import {ProfileDto} from './dto/profile.dto'

import {JwtAuthGuard} from './jwt-auth.guard';
import {TransformPasswordPipe} from './transform-password.pipe';
import {UniqueIdService} from '../crypto/unique-id.service';
import { BearerMiddleware } from './bearer.middleware';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {

    /**
     * Constructor
     * @param authService
     * @param uniqueIdService
     */
    constructor(private authService: AuthService, private uniqueIdService: UniqueIdService) {}


    /**
     * Register controller
     * @param dto 
     * @returns 
     */
    @UsePipes(ValidationPipe, TransformPasswordPipe)
    @HttpCode(200)
    @Post('register')
    async register(@Body() dto: RegisterDto) {
        console.log("входящие данные", dto)
        // Регистрируем пользователя, передавая объект dto
        return await this.authService.register(dto);
    }
    /**
     * Login Controller
     * @param dto 
     * @returns 
     */
    @HttpCode(200)
    @Post('login')
    async login(@Body() dto: LoginDto) {
        console.log(dto)
        return await this.authService.login(dto);
    }

    /**
     * Get detail User
     */

    // @HttpCode(200)
    // @Post('profile')
    // async create(@Body() dto: string) {
    //     console.log(dto)
    // }
}
