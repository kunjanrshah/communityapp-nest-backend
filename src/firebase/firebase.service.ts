import { Injectable, Logger } from '@nestjs/common';
import admin from 'firebase-admin';
import * as serviceAccount from '../../public/firebase-service-account.json';

@Injectable()
export class FirebaseService {
  private readonly logger = new Logger(FirebaseService.name);
  private messaging: admin.messaging.Messaging;

  constructor() {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
      });
    }
    this.messaging = admin.messaging();
  }

  // Sends a push notification to a single device token.
  async sendNotification(token: string, title: string, body: string): Promise<void> {
    await this.sendNotificationToTokens([token], title, body);
  }

  /**
   * Sends a push notification to one or more device tokens.
   *
   * Mirrors the legacy FCM payload used by the old CodeIgniter API
   * (`registration_ids` + `data` + `notification`) so the Android client keeps
   * receiving the `message` / `user_id` keys it reads from the data payload.
   */
  async sendNotificationToTokens(
    tokens: string[],
    title: string,
    body: string,
    data: Record<string, string> = {},
  ): Promise<void> {
    // The legacy API ignored tokens shorter than 11 chars (dummy placeholders).
    const validTokens = tokens.filter((token) => !!token && token.length > 10);

    if (validTokens.length === 0) {
      this.logger.warn('No valid device tokens found — notification skipped');
      return;
    }

    const message: admin.messaging.MulticastMessage = {
      tokens: validTokens,
      notification: { title, body },
      data: { ...data, message: body },
    };

    try {
      const response = await this.messaging.sendMulticast(message);
      this.logger.log(
        `Notification sent. success=${response.successCount} failure=${response.failureCount}`,
      );
    } catch (error) {
      // Never let a push failure break the API call.
      this.logger.error('Error sending notification', error as Error);
    }
  }
}
