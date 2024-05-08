import { Controller, Post, Body, HttpCode, Param, Get } from '@nestjs/common';
import { ProfileService } from './profile.service';

@Controller('profile')
export class ProfileController {
    constructor(private readonly profileService: ProfileService) {}
    @Post()
    @HttpCode(200)
    async createProfile(@Body() dto: any) {
        console.log(dto)
        return await this.profileService.getDataAboutUser(dto);
    }

    @Get(':id')
    async getProfileById(@Param('id') id: number) {
        // return await this.profileService.getProfileById(id);
    }
}
