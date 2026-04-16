import { Injectable, Logger } from '@nestjs/common';
import { Expo, ExpoPushMessage } from 'expo-server-sdk';

@Injectable()
export class NotificationsService {
  private expo: Expo;
  private readonly logger = new Logger(NotificationsService.name);

  constructor() {
    // Initialize Expo SDK client
    this.expo = new Expo({ accessToken: process.env.EXPO_ACCESS_TOKEN });
  }

  async sendPushNotification(pushTokens: string[], title: string, body: string, data?: any) {
    const messages: ExpoPushMessage[] = [];

    for (const pushToken of pushTokens) {
      if (!Expo.isExpoPushToken(pushToken)) {
        this.logger.error(`Push token ${pushToken} is not a valid Expo push token`);
        continue;
      }

      messages.push({
        to: pushToken,
        sound: 'default',
        title: title,
        body: body,
        data: data || {},
      });
    }

    const chunks = this.expo.chunkPushNotifications(messages);
    const tickets = [];

    for (const chunk of chunks) {
      try {
        const ticketChunk = await this.expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
      } catch (error) {
        this.logger.error('Error sending push notifications', error);
      }
    }

    return tickets;
  }
}
