// src/your-service/your.service.ts
import { Injectable } from '@nestjs/common';
import { TelegramService } from '../telegram/telegram.service';

@Injectable()
export class NotifyService {
  constructor(private readonly telegramService: TelegramService) {}

  async notifyClient(chatId: number, message: string) {
    await this.telegramService.sendMessage(chatId, message);
  }
}
