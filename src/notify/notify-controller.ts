import { Controller, Get, Query } from '@nestjs/common';
import { NotifyService } from './notify.service';

@Controller('notify')
export class NotifyController {
  constructor(private readonly notifyService: NotifyService) {}

  @Get()
  async sendNotification(@Query('chatId') chatId: number, @Query('message') message: string) {
    try {
      console.log('chatId --', chatId)
      await this.notifyService.notifyClient(chatId, message);
      return { status: 'success', message: 'Notification sent' };
    } catch (error) {
      return { status: 'error', message: 'Failed to send notification' };
    }
  }
}
