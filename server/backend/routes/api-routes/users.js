import express from "express";
import { PrismaClient } from "@prisma/client";
import {body, validationResult} from "express-validator";
import * as argon2 from "argon2";
const router = express.Router();

router.post(
    "/login", 
    body("username").isString().notEmpty().withMessage("Username is required"),
    body("password").isString().notEmpty().withMessage("Password is required"),
    async (req, res) => {

        // Validate request body
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { username, password } = req.body;
        const prisma = new PrismaClient();
        try {
            const user = await prisma.user.findUnique({
                where: {
                    username: username,
                },
            });
            if (!user) {
                return res.status(403).json({ message: "Invalid credentials" });
            }
            const isPasswordValid = await argon2.verify(user.password, password)
            if (!isPasswordValid) {
                return res.status(403).json({ message: "Invalid credentials" });
            }
            req.session.isLoggedIn = true;
            req.session.user = user;
            
            // Remove password from user object
            delete req.session.user.password; 

            res.status(200).json({ message: "Login successful" });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Something went wrong" });
        }
});

// Userdata retrieval
router.get("/me", async (req, res) => {
    const user = req.session.user;
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
});

// logout
router.delete("/logout", async (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ message: "Something went wrong" });
        }
        res.status(200).json({ message: "Logout successful" });
    });
});

export default router;