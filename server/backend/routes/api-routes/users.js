import express from "express";
import { PrismaClient } from "@prisma/client";
import {body, validationResult} from "express-validator";
import * as argon2 from "argon2";
const router = express.Router();
const prisma = new PrismaClient();

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

            // Check if user is active
            if (!user.isActive) {
                return res.status(403).json({ message: "User is disabled" });
            }

            req.session.isLoggedIn = true;
            req.session.user = user;
            req.session.user.lastUpdatedDB = new Date();
            
            // Remove password from user object
            delete req.session.user.password; 

            // update lastLoggedIn 
            await prisma.user.update({
                where: {
                    id: user.id,
                },
                data: {
                    lastLogin: new Date(),
                },
            });

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
    if (req.session.user.lastUpdatedDB) {
        const lastUpdatedDB = new Date(req.session.user.lastUpdatedDB);
        const currentTime = new Date();
        const diffInMinutes = Math.floor((currentTime - lastUpdatedDB) / (1000 * 60));
        if (diffInMinutes > 3) {
            // Fetch user data from the database
            const updatedUser = await prisma.user.findUnique({
                where: {
                    id: user.id,
                },
            });
            req.session.user = updatedUser;
            req.session.user.lastUpdatedDB = new Date();
        }
    }
    res.status(200).json(user);
});

// update account
router.put(
    "/me", 
    body("email").isEmail().withMessage("Invalid email format"),
    body("firstName").isString().notEmpty().withMessage("First name is required"),
    body("lastName").isString().notEmpty().withMessage("Last name is required"),
    body("isActive").isBoolean().withMessage("isActive must be a boolean"),
    body("role").isString().notEmpty().custom((role) => {
        const validRoles = ["ADMIN", "USER", "VIEWER"];
        if (!validRoles.includes(role)) {
            throw new Error(`Role must be one of: ${validRoles.join(", ")}`);
        }
        return true;
    }).withMessage("Role is required"),
    async (req, res) => {
        const { email, firstName, lastName, isActive, role } = req.body;
        const currentUser = req.session.user;

        if (!currentUser) {
            return res.status(404).json({ message: "User not found" });
        }

        if (currentUser.role !== "ADMIN" && role !== currentUser.role) {
            return res.status(401).json({ message: "Permission denied" });
        }
        
        const result = await prisma.user.update({
            where: {
                id: currentUser.id,
            },
            data: {
                email,
                firstName,
                lastName,
                isActive: currentUser.role === "ADMIN" ? isActive : currentUser.isActive,
                role: currentUser.role === "ADMIN" ? role : currentUser.role
            },
        })

        if (!result) {
            return res.status(404).json({ message: "User not found" });
        }

        // Update session user data
        req.session.user = {
            ...req.session.user,
            email,
            firstName,
            lastName,
            isActive: currentUser.role === "ADMIN" ? isActive : currentUser.isActive,
            role: currentUser.role === "ADMIN" ? role : currentUser.role
        };

        console.log("Updated user data in session:", req.session.user);
        
        // Remove password from user object
        delete req.session.user.password;
        res.status(200).json({ message: "User updated successfully" });
    }
);

router.post("/change-password",
    body("oldPassword").isString().notEmpty().withMessage("Old password is required"),
    body("newPassword").isString().notEmpty().withMessage("New password is required"),
    async (req, res) => {

        // Validate request body
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { oldPassword, newPassword } = req.body;
        const currentUser = req.session.user;

        if (!currentUser) {
            return res.status(404).json({ message: "User not found" });
        }

        const user = await prisma.user.findUnique({
            where: {
                id: currentUser.id,
            },
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const isOldPasswordValid = await argon2.verify(user.password, oldPassword);
        if (!isOldPasswordValid) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const hashedNewPassword = await argon2.hash(newPassword);

        await prisma.user.update({
            where: {
                id: currentUser.id,
            },
            data: {
                password: hashedNewPassword,
            },
        });

        res.status(200).json({ message: "Password changed successfully" });
    }
)

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