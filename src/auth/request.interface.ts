// Создайте файл request.interface.ts

import { Request } from 'express';

interface CustomRequest extends Request {
    user?: any; // Здесь вы можете указать тип для объекта пользователя, если он известен
}

export default CustomRequest;
