import express from "express";
import expressSession from "express-session";
import { PrismaClient } from "@prisma/client";
import { PrismaSessionStore } from '@quixo3/prisma-session-store';
const router = express.Router();

// Session Handler
router.use(
    expressSession({
        cookie: {
         maxAge: 7 * 24 * 60 * 60 * 1000, // ms
         secure: process.env.NODE_ENV == "development" ? false : true, // Set to true if using HTTPS
         httpOnly: true,
         sameSite: 'strict',
        },
        secret: process.env.SESSION_SECRET,
        resave: true,
        saveUninitialized: false,
        store: new PrismaSessionStore(
          new PrismaClient(),
          {
            checkPeriod: 60 * 1000,  //ms
            dbRecordIdIsSessionId: true,
            dbRecordIdFunction: undefined,
          }
        )
      })
);

// routes
import alertsRouter from "./api-routes/alerts.js";
import usersRouter from "./api-routes/users.js";

// mount routes
router.use("/alerts", alertsRouter);
router.use("/users", usersRouter);

export default router;