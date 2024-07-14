import { Injectable } from '@nestjs/common';

@Injectable()
export class TerminalService {
  executeCommand(): string {
    // Реализуйте вашу логику здесь
    return 'Выполнение команды из TerminalService';
  }
}
