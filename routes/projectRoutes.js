import express from "express";
import {
    getAllProjects,
    getFilterOptions,
  getProjectDetails,
  createProject,
} from "../controllers/projectController.js";
import { protect, admin } from "../middleware/authMiddleware.js";
import { uploadMultipleImages } from "./uploadRoutes.js";

const router = express.Router();

// Define GET and POST separately for the same route "/"
router.route("/").get(getAllProjects);
router.get("/filters", getFilterOptions);
router.post("/create", uploadMultipleImages, protect, admin, createProject);

// Define route for fetching project details by ID
router.get("/:id", getProjectDetails);

export default router;
