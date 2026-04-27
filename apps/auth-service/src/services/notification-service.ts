import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";
const snsClient = new SNSClient({
    region: process.env.AWS_REGION,
    endpoint: process.env.NODE_ENV === 'development' ? process.env.SNS_ENDPOINT : undefined,
});

export class NotificationService {
    static async sendNotification(topicArn: string, message: string) {
        try {
            const result = await snsClient.send(new PublishCommand({
                TopicArn: topicArn,
                Message: message
            }));
            console.log(`✅ Notification published to topic ${topicArn}`);
            return result;
        } catch (error) {
            console.error("Error sending notification:", error);
            throw error;
        }
    }
}