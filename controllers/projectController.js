import Project from "../models/projectModel.js";
import asyncHandler from "../middleware/asyncHandler.js";
import logger from "../logger.js";

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
      project: project,
    });
  } catch (error) {
    logger.error("Error fetching project details:", error);
    res.status(500).json({ message: "Error fetching project details" });
  }
});

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
    const images = req.files.map((file) => `/${file.path}`);

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

    return res.redirect("/admin");
  } catch (error) {
    logger.error("Error creating project:", error);
    res.status(500).json({ message: "Error creating project" });
  }
});

export { getAllProjects, getFilterOptions, getProjectDetails, createProject };
