import {PrismaClient} from "@prisma/client";
const prisma = new PrismaClient();
import { prepareDiscordMessage, prepareSlackMessage, prepareTelegramMessage } from "./prepare-notifications.js";

async function send(xssAlertId){
    // Check what channels are enabled for this alert
    const settings = await prisma.settings.findMany();

    const notificationsEnabled = settings.find(setting => setting.key === 'notifications_enabled').value;
    const discordEnabled = settings.find(setting => setting.key === 'discord_enabled').value;
    const slackEnabled = settings.find(setting => setting.key === 'slack_enabled').value;
    const telegramEnabled = settings.find(setting => setting.key === 'telegram_enabled').value;

    if (!notificationsEnabled) {
        console.log('Notifications are disabled.');
        return;
    }

    // Fetch the alert details
    const xssAlert = await prisma.xSSAlert.findUnique({
        where: { id: xssAlertId },
        include: {
            location: true,
            Screenshot: true,
            document: true,
        }
    });
    
    
    // Send to Discord if enabled
    if (discordEnabled) {
        const discordMessage = prepareDiscordMessage(xssAlert);
        const discordWebhookUrl = settings.find(setting => setting.key === 'discord_webhook').value;
        const response = await fetch(discordWebhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(discordMessage)
        });
        if (response.status != 204){
            console.log(`Discord response: ${response.status} ${response.statusText} - ${await response.text()}`);
        }
    }

    

    // Send to Slack if enabled
    if (slackEnabled) {
        const slackMessage = prepareSlackMessage(xssAlert);
        const slackWebhookUrl = settings.find(setting => setting.key === 'slack_webhook').value;
        const response = await fetch(slackWebhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(slackMessage)
        });
        if (response.status != 200){
            console.log(`Slack response: ${response.status} ${response.statusText} - ${await response.text()}`);
        }
    }


    // Send to telegram if enabled
    if (telegramEnabled) {
        const telegramMessage = prepareTelegramMessage(xssAlert);
        const telegramBotToken = settings.find(setting => setting.key === 'telegram_bot_token').value;
        const telegramChatId = settings.find(setting => setting.key === 'telegram_chat_id').value;
        const telegramUrl = `https://api.telegram.org/bot${telegramBotToken}/sendMessage`;
        const response = await fetch(telegramUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                chat_id: telegramChatId,
                text: telegramMessage,
                parse_mode: 'Markdown'
            })
        });
    }
}

export default send;