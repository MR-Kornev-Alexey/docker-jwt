import {
    Controller,
    Post,
    Body,
    HttpCode,
    Param,
    Get,
    UsePipes,
    ValidationPipe,
    HttpException,
    HttpStatus
} from '@nestjs/common';
import { CustomersService } from './сustomers.service';
import {TransformPasswordPipe} from "../auth/transform-password.pipe";
import {CheckService} from "../check/check.service";

@Controller('customers')
export class CustomersController {
    constructor(private readonly customersService: CustomersService,
                private checkService: CheckService) {}
    @Post('all_customers')
    @HttpCode(200)
    async getAllCustomers(@Body() dto: any) {
        return await this.customersService.getCustomers(dto);
    }
    @Get('find_role_customer')
    @HttpCode(200)
    async checkSuperVisor() {
        return await this.customersService.checkSV();
    }
    @Post('check_additional_data')
    @HttpCode(200)
    async checkAdditionalData(@Body() dto: any) {
        return await this.customersService.checkCustomersAddData(dto);
    }
    @Post('init_additional_data_customer')
    @HttpCode(200)
    async createAdditionalData(@Body() dto: any) {
        return await this.customersService.createCustomersAddData(dto);
    }
    @Post('get_data_about_one_customer')
    @HttpCode(200)
    async getDataAboutOneCustomer(@Body() dto: any) {
        return await this.customersService.getDataAboutOneCustomer(dto);
    }
    @Post('create_new_customer')
    @HttpCode(200)
    @UsePipes(TransformPasswordPipe)
    async addNewCustomer(@Body() dto: any) {
        return await this.customersService.createNewCustomer(dto);
    }
    @Post('delete_one_customer')
    @HttpCode(200)
    async deleteOneCustomer(@Body() dto: any) {
        const checkAccess = await this.checkService.checkUserAccess(dto.email);
        if (!checkAccess) { // Проверяем, является ли пользователь администратором
            throw new HttpException('Доступ запрещен', HttpStatus.FORBIDDEN);
        }
        return await this.customersService.deleteOneCustomer(dto);
    }
}

