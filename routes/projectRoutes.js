// routes/projectRoutes.js
import express from 'express';
import { getAllProjects, getProjectDetails, createProject } from '../controllers/projectController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(getAllProjects).post(protect, admin, createProject);
router.route('/:id').get(getProjectDetails);

export default router;
