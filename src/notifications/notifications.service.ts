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
    if (lastHours) {
      return {
        gte: subHours(new Date(), lastHours),
      };
    }
    return {
      gte: new Date(startDate),
      lte: new Date(endDate),
    };
  }

  private async getNotifications(email: string, dateFilter: object, allObject: string[]) {
    try {
      const checkUser = await this.checkService.checkUserSuperVisor(email);
      if (checkUser) {
        return await this.dbService.m_notifications.findMany({
          where: {
            created_at: dateFilter,
          },
        });
      } else {
        return await this.dbService.m_notifications.findMany({
          where: {
            object_id: { in: allObject },
            created_at: dateFilter,
          },
        });
      }
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
      return { statusCode: HttpStatus.OK, message: 'Operation completed successfully', notifications };
    } catch (error) {
      return { statusCode: error.getStatus(), message: error.message };
    }
  }

  async getNotificationsAboutPeriod(dto) {
    try {
      console.log('dto --', dto);
      const { startDate, endDate } = dto.period;
      const dateFilter = this.createDateFilter(startDate, endDate);
      const allObject = await this.createListOfObjects(dto.email);
      const notifications = await this.getNotifications(dto.email, dateFilter, allObject);
      return { statusCode: HttpStatus.OK, message: 'Operation completed successfully', notifications };
    } catch (error) {
      return { statusCode: error.getStatus(), message: error.message };
    }
  }
}
