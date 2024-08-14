import express from "express";
import {
  createEvent,
  getEvents,
  getEventById,
} from "../controllers/eventController.js";
import { protect, admin } from "../middleware/authMiddleware.js";
import { uploadMultipleImages } from "./uploadRoutes.js";

const router = express.Router();

router.post("/create", uploadMultipleImages, protect, admin, createEvent);
router.get("/", protect, getEvents);
router.get("/:id", protect, getEventById);

export default router
