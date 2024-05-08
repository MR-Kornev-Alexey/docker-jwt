import {Injectable} from '@nestjs/common';
import {createHash} from 'crypto';

@Injectable()
export class UniqueIdService {
    generateUniqueId(email: string): string {
        // Создаем хэш SHA256 от email
        const hash = createHash('sha256');
        hash.update(email);

        // Получаем хэш в виде строки и обрезаем до 16 символов
        return hash.digest('hex').slice(0, 16);
    }
}
