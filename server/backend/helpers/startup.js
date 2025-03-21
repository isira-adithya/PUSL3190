import { PrismaClient, UserRole } from "@prisma/client";
import crypto from "crypto";
const prisma = new PrismaClient();
import * as argon2 from "argon2";

const SETTINGS = {
    // notifications
    notifications_enabled: true,

    // smtp
    smtp_host: "smtp.example.com",
    smtp_port: 587,
    smtp_user: "",
    smtp_pass: "",
    smtp_from: "",

    // discord,slack,telegram
    discord_webhook: "",
    slack_webhook: "",
    telegram_bot_token: "",
    telegram_chat_id: "",

    // ip identification
    ipHeader: "X-Forwarded-For",
}

async function ensureSettings() {
    // Create settings keys if not set
    for (const key in SETTINGS) {
        const setting = await prisma.settings.findUnique({
            where: { key: key }
        });
        if (!setting) {
            await prisma.settings.create({
                data: {
                    key: key,
                    value: SETTINGS[key],
                },
            });
        }
    }
}

async function configureAdmin(){
    // Check if there is atleast one admin account present in the database
    const adminCount = await prisma.user.count({
        where: {
            role: UserRole.ADMIN
        }
    });
    if (adminCount > 0) {
        return;
    } else {
        // Create a new admin account
        const username = "admin";
        const password = crypto.randomBytes(16).toString("hex");
        // Hash the password using argon2
        const hashedPassword = await argon2.hash(password, {
            timeCost: 5,
        });
        // Create the user in the database
        const newUser = await prisma.user.create({
            data: {
                username: username,
                password: hashedPassword,
                role: UserRole.ADMIN,
            },
        });
        console.log(`[LOG] Admin account created with username: ${username} and password: ${password}`);
    }
}

async function checkStartup(){
    await ensureSettings();
    await configureAdmin();
    console.log("[LOG] Startup checks completed.");
}

export default checkStartup;