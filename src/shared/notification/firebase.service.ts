import { Injectable, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';
import * as serviceAccountJson from '../../firebase-admin-sdk.json';

@Injectable()
export class FirebaseService {
    private readonly logger = new Logger(FirebaseService.name);
    private readonly messaging: any;

    constructor() {
         try {
            if (!admin.apps.length) {
                admin.initializeApp({
                    credential: admin.credential.cert(
                        serviceAccountJson as admin.ServiceAccount,
                    ),
                });
            }
            this.messaging = admin.messaging();
        } catch (err) {
            throw new Error('Firebase initialization failed');
        }
    }

    async sendPushNotification(
        token: string,
        title: string,
        body: string,
        data?: Record<string, string>,
        imageUrl?: string
    ): Promise<boolean> {
        try {
            const message: admin.messaging.Message = {
                token,
                notification: {
                    title,
                    body,
                    imageUrl,
                },
                data: data || {},
                android: {
                    notification: {
                        imageUrl,
                        icon: 'ic_notification',
                        color: '#ffa54b',
                        sound: 'default',
                    },
                },
                apns: {
                    payload: {
                        aps: {
                            sound: 'default',
                            badge: 1,
                        },
                    },
                    fcmOptions: {
                        imageUrl,
                    },
                },
                webpush: {
                    notification: {
                        icon: '/icon-192x192.png',
                        badge: '/badge-72x72.png',
                        image: imageUrl,
                    },
                },
            };

            const response = await admin.messaging().send(message);
            this.logger.log(`Push notification sent successfully: ${response}`);
            return true;
        } catch (error) {
            this.logger.error(`Failed to send push notification to token ${token}:`, error);
            return false;
        }
    }

    async sendMulticastNotification(
        tokens: string[],
        title: string,
        body: string,
        data?: Record<string, string>,
        imageUrl?: string
    ): Promise<{ successCount: number; failureCount: number; failedTokens: string[] }> {
        if (tokens.length === 0) {
            return { successCount: 0, failureCount: 0, failedTokens: [] };
        }

        try {
            const message: admin.messaging.MulticastMessage = {
                tokens,
                notification: {
                    title,
                    body,
                    imageUrl,
                },
                data: data || {},
                android: {
                    notification: {
                        imageUrl,
                        icon: 'ic_notification',
                        color: '#ffa54b',
                        sound: 'default',
                    },
                },
                apns: {
                    payload: {
                        aps: {
                            sound: 'default',
                            badge: 1,
                        },
                    },
                    fcmOptions: {
                        imageUrl,
                    },
                },
                webpush: {
                    notification: {
                        icon: '/icon-192x192.png',
                        badge: '/badge-72x72.png',
                        image: imageUrl,
                    },
                },
            };

            const response = await admin.messaging().sendEachForMulticast(message);

            const failedTokens: string[] = [];
            response.responses.forEach((resp, idx) => {
                if (!resp.success) {
                    failedTokens.push(tokens[idx]);
                }
            });

            this.logger.log(`Multicast notification sent. Success: ${response.successCount}, Failure: ${response.failureCount}`);

            return {
                successCount: response.successCount,
                failureCount: response.failureCount,
                failedTokens,
            };
        } catch (error) {
            this.logger.error('Failed to send multicast notification:', error);
            return { successCount: 0, failureCount: tokens.length, failedTokens: tokens };
        }
    }

    async validateToken(token: string): Promise<boolean> {
        try {
            // Send a test message to validate token
            await admin.messaging().send({
                token,
                data: { test: 'true' },
            }, true); // dry run
            return true;
        } catch (error: unknown) {
            this.logger.warn(`Invalid Firebase token: ${token}`, error);
            return false;
        }
    }

    async subscribeToTopic(token: string, topic: string): Promise<boolean> {
        try {
            await admin.messaging().subscribeToTopic([token], topic);
            this.logger.log(`Token subscribed to topic: ${topic}`);
            return true;
        } catch (error) {
            this.logger.error(`Failed to subscribe token to topic ${topic}:`, error);
            return false;
        }
    }

    async unsubscribeFromTopic(token: string, topic: string): Promise<boolean> {
        try {
            await admin.messaging().unsubscribeFromTopic([token], topic);
            this.logger.log(`Token unsubscribed from topic: ${topic}`);
            return true;
        } catch (error) {
            this.logger.error(`Failed to unsubscribe token from topic ${topic}:`, error);
            return false;
        }
    }

    async sendTopicNotification(
        topic: string,
        title: string,
        body: string,
        data?: Record<string, string>,
        imageUrl?: string
    ): Promise<boolean> {

        try {
            const message: admin.messaging.Message = {
                topic,
                notification: {
                    title,
                    body,
                    imageUrl,
                },
                data: data || {},
                android: {
                    notification: {
                        imageUrl,
                        icon: 'ic_notification',
                        color: '#ffa54b',
                        sound: 'default',
                    },
                },
                apns: {
                    payload: {
                        aps: {
                            sound: 'default',
                            badge: 1,
                        },
                    },
                    fcmOptions: {
                        imageUrl,
                    },
                },
                webpush: {
                    notification: {
                        icon: '/icon-192x192.png',
                        badge: '/badge-72x72.png',
                        image: imageUrl,
                    },
                },
            };

            const response = await admin.messaging().send(message);
            this.logger.log(`Topic notification sent successfully: ${response}`);
            return true;
        } catch (error) {
            this.logger.error(`Failed to send topic notification to ${topic}:`, error);
            return false;
        }
    }
}
