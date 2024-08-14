import express from "express";
import {
  createEvent,
  getEvents,
  getEventById,
  editEvent,
  deleteEvent,
} from "../controllers/eventController.js";
import { protect, admin } from "../middleware/authMiddleware.js";
import { uploadMultipleImages } from "./uploadRoutes.js";

const router = express.Router();

// Define routes for creating, getting, updating, and deleting events
router.post("/create", uploadMultipleImages, protect, admin, createEvent);
router.get("/", protect, getEvents);
router.get("/:id", protect, getEventById);

// Define routes for editing and deleting events
router.put("/:id/edit", uploadMultipleImages, protect, admin, editEvent);
router.delete("/:id/delete", protect, admin, deleteEvent);

export default router;
