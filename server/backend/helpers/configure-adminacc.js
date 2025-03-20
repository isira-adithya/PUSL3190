import { PrismaClient, UserRole } from "@prisma/client";
import crypto from "crypto";
const prisma = new PrismaClient();
import * as argon2 from "argon2";

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

export default configureAdmin;