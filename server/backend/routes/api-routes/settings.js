import express from 'express';
import { body, validationResult } from 'express-validator';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const router = express.Router();

// get settings
router.get('/', async (req, res) => {
    const role = req.session.user.role;
    if (role !== 'ADMIN') {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    try {
        const settings = await prisma.settings.findMany();
        const jsonObj = {};
        for (const setting of settings) {
            // mark the smtp pass
            if (setting.key === 'smtp_pass') {
                setting.value = '********';
            }
            jsonObj[setting.key] = setting.value;
        }
        return res.status(200).json(jsonObj);
    } catch (error) {
        console.error('Error fetching settings:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

// update settings
router.put(
    '/', 
    body('notifications_enabled').isBoolean(),
    body('smtp_host').isString(),
    body('smtp_port').isInt(),
    body('smtp_user').isString(),
    body('smtp_pass').isString(),
    body('smtp_from').isEmail(),
    body('discord_enabled').isBoolean(),
    body('slack_enabled').isBoolean(),
    body('telegram_enabled').isBoolean(),
    body('discord_webhook').isURL(),
    body('slack_webhook').isURL(),
    body('telegram_bot_token').isString(),
    body('telegram_chat_id').isString(),
    body('ipHeader').isString(),
    async (req, res) => {
        // Validate the request body
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        // Check if the user is an admin
        const role = req.session.user.role;
        if (role !== 'ADMIN') {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // Update settings in the database
        try {
            const currentSettings = await prisma.settings.findMany();
            for (const setting of currentSettings) {
                await prisma.settings.update({
                    where: { key: setting.key },
                    data: {
                        value: req.body[setting.key] || setting.value,
                    }
                });
            }
            const updatedSettings = await prisma.settings.findMany();
            const jsonObj = {};
            for (const setting of updatedSettings) {
                // mark the smtp pass
                if (setting.key === 'smtp_pass') {
                    setting.value = '********';
                }
                jsonObj[setting.key] = setting.value;
            }
            
            return res.status(200).json(jsonObj);
        } catch (error) {
            console.error('Error updating settings:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }
);

export default router;