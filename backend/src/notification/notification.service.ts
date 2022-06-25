import * as webPush from 'web-push';
import { Injectable, Logger } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class NotificationService {
  private readonly subscriptions: webPush.PushSubscription[] = [];

  private readonly logger = new Logger(NotificationService.name);

  constructor() {
    this.setupWebPush();
  }

  getIndex(): string {
    return 'Welcome to Dance with me web-push';
  }

  addSubscription(request: Request): string {
    this.subscriptions.push(request.body);

    this.logger.log('Request', request.body);

    return 'added';
  }

  sendNotification(): string {
    let returnText = 'test';
    this.logger.log('Subscriptions', this.subscriptions);

    const notificationPayload = {
      notification: {
        title: 'Dance with me',
        body: 'New event in your location',
        icon: '../../assets/img/dance.jpg',
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        vibrate: [300, 100, 400],
        data: {
          dateOfArrival: Date.now(),
          primaryKey: 1,
        },
        actions: [
          {
            action: 'open',
            title: 'Open',
          },
        ],
      },
    };

    this.subscriptions.forEach((subscription) => {
      webPush
        .sendNotification(subscription, JSON.stringify(notificationPayload))
        .then((sub) => {
          this.logger.log('Sending successfull', sub);
          returnText = 'success';
        })
        .catch((error) => {
          this.logger.error(error);
          returnText = 'fail';
        });
      return returnText;
    });

    return returnText;
  }

  setupWebPush(): void {
    webPush.setVapidDetails(
      'mailto:my_email@my_domain.com',
      'BMpsMmCEIm_5UDo9GImyXTSIzwaSbJTh-CxEu1wsPjJGHQhOKsK-KFP8Z0O3H_TixTbEEoxaDfu2ByF7mxAubnk',
      '0Dg83OKBTGxBdhcOPJ3qgwdJ5YUFB6FULFEPtO8rtPA',
    );
  }
}
