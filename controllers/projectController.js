import Project from "../models/projectModel.js";
import asyncHandler from "../middleware/asyncHandler.js";
import logger from "../logger.js";

// Get all projects with optional filters and sorting
const getAllProjects = asyncHandler(async (req, res) => {
  try {
    const { title, faculty, department, minBudget, maxBudget, sortBy, order } =
      req.query;
    let query = {};

    if (title) query.title = { $regex: title, $options: "i" };
    if (faculty) query.faculty = faculty;
    if (department) query.department = department;
    if (minBudget) query.budget = { ...query.budget, $gte: Number(minBudget) };
    if (maxBudget) query.budget = { ...query.budget, $lte: Number(maxBudget) };

    let sortOptions = {};
    if (sortBy) {
      const sortOrder = order === "desc" ? -1 : 1;
      sortOptions[sortBy] = sortOrder;
    }

    const projects = await Project.find(query).sort(sortOptions);
    if (!projects) {
      logger.warn("No projects available");
      return res.status(200).json({ message: "No projects available" });
    }

    res.render("pages/ProjectPage", {
      projects,
      title: "Projects",
    });
  } catch (error) {
    logger.error("Error fetching projects:", error);
    res.status(500).json({ message: "Error fetching projects" });
  }
});

// Get filter options for faculties, departments, and timelines
const getFilterOptions = asyncHandler(async (req, res) => {
  try {
    const faculties = await Project.distinct("faculty");
    const departments = await Project.distinct("department");
    const timelines = await Project.distinct("timeline");

    res.status(200).json({
      faculties,
      departments,
      timelines,
    });
  } catch (error) {
    logger.error("Error fetching filter options:", error);
    res.status(500).json({ message: "Error fetching filter options" });
  }
});

// Get project details by ID
const getProjectDetails = asyncHandler(async (req, res) => {
  try {
    const projectId = req.params.id;
    const project = await Project.findById(projectId);
    if (!project) {
      logger.warn(`Project with ID ${projectId} not found`);
      return res.status(404).json({ message: "Project not found" });
    }

    res.render("pages/ProjectDetailsPage", {
      title: "Project Details",
      project,
    });
  } catch (error) {
    logger.error("Error fetching project details:", error);
    res.status(500).json({ message: "Error fetching project details" });
  }
});

// Create a new project
const createProject = asyncHandler(async (req, res) => {
  try {
    const {
      title,
      description,
      purpose,
      goals,
      timeline,
      budget,
      faculty,
      department,
    } = req.body;

    // Extracting the paths of uploaded images
    const images = req.files ? req.files.map((file) => `/${file.path}`) : [];

    const newProject = new Project({
      title,
      description,
      goals,
      purpose,
      timeline,
      budget,
      amountContributed: 0, // Initialize amountContributed to 0
      faculty,
      department,
      images,
    });

    const savedProject = await newProject.save();

    logger.info("Project created successfully:", savedProject);
    res.status(201).json({ success: true, savedProject });
  } catch (error) {
    logger.error("Error creating project:", error);
    res.status(500).json({ message: "Error creating project" });
  }
});

// Edit an existing project
const editProject = asyncHandler(async (req, res) => {
  const projectId = req.params.id;
  const {
    title,
    description,
    purpose,
    goals,
    timeline,
    budget,
    faculty,
    department,
  } = req.body;

  // Handling image uploads
  const images = req.files
    ? req.files.map((file) => `/${file.path}`)
    : undefined;

  try {
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Update project details
    project.title = title || project.title;
    project.description = description || project.description;
    project.purpose = purpose || project.purpose;
    project.goals = goals || project.goals;
    project.timeline = timeline || project.timeline;
    project.budget = budget || project.budget;
    project.faculty = faculty || project.faculty;
    project.department = department || project.department;
    if (images) {
      project.images = images;
    }

    await project.save();

    logger.info(`Project with ID ${projectId} updated successfully`);
    res.status(200).json({ message: "Project updated successfully", project });
  } catch (error) {
    logger.error(`Error updating project with ID ${projectId}:`, error);
    res.status(500).json({ message: "Error updating project" });
  }
});

// Delete a project
const deleteProject = asyncHandler(async (req, res) => {
  const projectId = req.params.id;

  try {
    const project = await Project.findByIdAndDelete(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    logger.info(`Project with ID ${projectId} deleted successfully`);
    res.status(200).json({ message: "Project deleted successfully" });
  } catch (error) {
    logger.error(`Error deleting project with ID ${projectId}:`, error);
    res.status(500).json({ message: "Error deleting project" });
  }
});

export {
  getAllProjects,
  getFilterOptions,
  getProjectDetails,
  createProject,
  editProject,
  deleteProject,
};
