import { Controller, Post, Body, HttpCode, Param, Get } from '@nestjs/common';
import { OrganizationService } from './organization.service';

@Controller('organization')
export class OrganizationController {
    constructor(private readonly organizationService: OrganizationService) {}
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
    @Get('get_all_organizations')
    @HttpCode(200)
    async getAllOrganisations() {
        return await this.organizationService.getAllOrganizationsApi();
    }

}

