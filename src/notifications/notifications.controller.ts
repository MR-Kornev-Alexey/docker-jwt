import { Controller, Post, Body, HttpCode, Param, Get } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsFormInput } from '../types/notificationsFormInput'

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}
  @Post('get_notifications_last_day')
  @HttpCode(200)
  async getNotificationsLastDay(@Body() dto: NotificationsFormInput) {
    return await this.notificationsService.getNotificationsLastDay(dto);
  }
  @Post('get_all_notifications')
  @HttpCode(200)
  async getAllObject(@Body() dto: NotificationsFormInput) {
    return await this.notificationsService.getNotificationsAboutPeriod(dto);
  }

}

