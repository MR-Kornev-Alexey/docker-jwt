import { Injectable, HttpStatus, HttpException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { subHours } from 'date-fns';
import { CheckService } from '../check/check.service';

@Injectable()
export class NotificationsService {
  constructor(
    private dbService: PrismaService,
    private checkService: CheckService,
  ) {}

  private async createListOfObjects(email: string) {
    try {
      const user = await this.dbService.m_User.findFirst({
        where: { email },
        include: {
          organization: {
            include: {
              objects: true,
            },
          },
        },
      });
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
      return user.organization.objects.map(obj => obj.id);
    } catch (error) {
      throw new HttpException('Failed to fetch user objects', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  private createDateFilter(startDate?: string, endDate?: string, lastHours?: number) {
    // Если указан параметр lastHours, игнорируем startDate и endDate, и создаем фильтр с учетом времени последних часов
    if (lastHours) {
      return {
        gte: subHours(new Date(), lastHours),
      };
    }

    // Преобразуем строки в объекты Date
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    // Проверяем корректность дат и логически их упорядочиваем
    if (start && end) {
      if (end < start) {
        // Если endDate раньше startDate, меняем их местами
        return {
          gte: end,
          lte: start,
        };
      }
      return {
        gte: start,
        lte: end,
      };
    } else if (start) {
      return {
        gte: start,
      };
    } else if (end) {
      return {
        lte: end,
      };
    } else {
      // Если оба параметра отсутствуют, возвращаем пустой фильтр
      throw new HttpException('Необходимо указать хотя бы одну дату или количество последних часов', HttpStatus.BAD_REQUEST);
    }
  }

  private async getNotifications(email: string, dateFilter: object, allObject: string[]) {
    try {
      const checkUser = await this.checkService.checkUserSuperVisor(email);
      const whereCondition = checkUser
        ? { created_at: dateFilter }
        : { object_id: { in: allObject }, created_at: dateFilter };

      return await this.dbService.m_notifications.findMany({
        where: whereCondition,
      });
    } catch (error) {
      throw new HttpException('Failed to fetch notifications', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getNotificationsLastDay(dto) {
    try {
      console.log('dto --', dto);
      const dateFilter = this.createDateFilter(undefined, undefined, 24);
      const allObject = await this.createListOfObjects(dto.email);
      const notifications = await this.getNotifications(dto.email, dateFilter, allObject);
      return { statusCode: HttpStatus.OK, message: 'Загрузка уведомлений прошла успешно', notifications };
    } catch (error) {
      return { statusCode: error.getStatus(), message: error.message };
    }
  }

  async getNotificationsAboutPeriod(dto) {
    try {
      console.log('dto --', dto);
      const { startDate, endDate } = dto.period;

      // Создаем фильтр для даты с учетом возможных проблем с порядком дат
      const dateFilter = this.createDateFilter(startDate, endDate);

      // Получаем список объектов, связанных с пользователем
      const allObject = await this.createListOfObjects(dto.email);

      // Получаем уведомления за указанный период
      const notifications = await this.getNotifications(dto.email, dateFilter, allObject);

      return {
        statusCode: HttpStatus.OK,
        message: 'Загрузка уведомлений за указанный период прошла успешно',
        notifications,
      };
    } catch (error) {
      return {
        statusCode: error.getStatus ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Произошла ошибка при получении уведомлений',
      };
    }
  }
}
