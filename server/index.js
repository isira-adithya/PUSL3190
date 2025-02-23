import express from "express";
import { PrismaClient } from "@prisma/client";

// Create Prisma client instance
const prisma = new PrismaClient();

// Test Prisma connection
try {
    await prisma.$connect();
    console.log("Successfully connected to database");
} catch (error) {
    console.error("Prisma connection error:", error);
}

const server = express();
server.listen(3000, () => {
    console.log("Server running on port 3000");
});