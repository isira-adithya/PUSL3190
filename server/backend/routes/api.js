import express from "express";
const router = express.Router();

// routes
import alertsRouter from "./api/alerts.js";

// mount routes
router.use("/alerts", alertsRouter);

export default router;