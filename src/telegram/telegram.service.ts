// src/telegram/telegram.service.ts
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class TelegramService {
  constructor(private readonly httpService: HttpService) {}

  async sendMessage(chatId: number, message: string): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.httpService.post('http://nginx/telegram/message', {
          chatId,
          message,
        })
      );
      console.log('Message sent:', response.data);
    } catch (error) {
      console.error('Error sending message to Telegram bot:', error);
      throw new Error('Failed to send message');
    }
  }
}
