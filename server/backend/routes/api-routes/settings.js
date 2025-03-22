import express from 'express';
import { body, validationResult } from 'express-validator';
import { PrismaClient } from '@prisma/client';
import nodeMailer from 'nodemailer';
const prisma = new PrismaClient();
const router = express.Router();

router.use((req, res, next) => {
    const role = req.session.user.role;
    if (role !== 'ADMIN') {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
});

// get settings
router.get('/', async (req, res) => {
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

// test smtp
router.post(
    '/test-smtp', 
    body('smtp_host').isString(),
    body('smtp_port').isInt(),
    body('smtp_user').isString(),
    body('smtp_pass').isString(),
    body('smtp_from').isEmail(),
    async (req, res) => {

        // Validate the request body
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        var { smtp_host, smtp_port, smtp_user, smtp_pass, smtp_from } = req.body;
        if (smtp_pass === '********') {
            // get the smtp pass from the database
            const pass = await prisma.settings.findUnique({
                where: { key: 'smtp_pass' },
            });
            smtp_pass = pass.value;
        }

        try {
            const transporter = nodeMailer.createTransport({
                host: smtp_host,
                port: smtp_port,
                secure: smtp_port === 465, // true for 465, false for other ports
                auth: {
                    user: smtp_user,
                    pass: smtp_pass,
                },
            });

            const result = await transporter.verify();
            if (!result) {
                return res.status(500).json({ error: 'SMTP settings are invalid.' });
            }

            return res.status(200).json({ message: 'SMTP settings are valid.' });
        } catch (error) {
            console.error('Error testing SMTP settings:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
});

// test discord
router.post("/test-discord",
    body("discord_webhook").isURL(),
    async (req, res) => {
        // Validate the request body
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        var { discord_webhook } = req.body;

        try {
            const response = await fetch(discord_webhook, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ content: "Test message from the server." }),
            });

            if (!response.ok) {
                throw new Error("Failed to send test message.");
            }

            return res.status(200).json({ message: "Test message sent successfully." });
        } catch (error) {
            console.error("Error testing Discord webhook:", error);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    }
);

export default router;