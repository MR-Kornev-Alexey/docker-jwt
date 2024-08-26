import { Controller, Post, Body, HttpCode, Param, Get, HttpException, HttpStatus } from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { CheckService } from '../check/check.service';

@Controller('organization')
export class OrganizationController {
    constructor(private readonly organizationService: OrganizationService,
                private checkService: CheckService) {}
    @Post('initial_main_organization')
    @HttpCode(200)
    async initialMainOrganization(@Body() dto: any) {
        return await this.organizationService.initialNewMainOrganization(dto);
    }
    @Post('create_new_organization')
    @HttpCode(200)
    async createOrganisation(@Body() dto: any) {
        return await this.organizationService.createNewOrganization(dto);
    }
    @Post('check_organization')
    @HttpCode(200)
    async checkOrganisation(@Body() dto: any) {
        return await this.organizationService.checkOrganization(dto);
    }
    @Post('delete_one_organization')
    @HttpCode(200)
    async deleteOneOrganization(@Body() dto: any) {
        const checkAccess = await this.checkService.checkUserAccess(dto.email);
        if (!checkAccess) { // Проверяем, является ли пользователь администратором
            throw new HttpException('Доступ запрещен', HttpStatus.FORBIDDEN);
        } else {
            return await this.organizationService.deleteOneOrganization(dto);
        }
    }

    @Get('get_all_organizations')
    @HttpCode(200)
    async getAllOrganisations() {
        return await this.organizationService.getAllOrganizationsApi();
    }

}

