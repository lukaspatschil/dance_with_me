import { Controller, Get, Post, Req } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { Request } from 'express';

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  getIndex(): string {
    return this.notificationService.getIndex();
  }

  @Post()
  sendNotification(): string {
    return this.notificationService.sendNotification();
  }

  @Post('subscribe')
  postSubscribe(@Req() request: Request): string {
    return this.notificationService.addSubscription(request);
  }
}
