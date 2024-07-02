// controllers/projectController.js
import Project from "../models/projectModel.js";
import asyncHandler from "../middleware/asyncHandler.js";

const getAllProjects = asyncHandler(async (req, res) => {
  try {
    const projects = await Project.find({});
    // res.render("projects", { projects });
    if(!projects){
      res.status(200).json({message: "No projects available"})
    }
    res.status(200).json({
      status: "success",
      message: "Projects fetched successfully",
      data: projects,
    });
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({ message: "Error fetching projects" });
  }
});

const getProjectDetails = asyncHandler(async (req, res) => {
  try {
    const projectId = req.params.id;
    const project = await Project.findById(projectId);
    res.render("projectDetail", { project });
    res.status(200).json({
      status: "success",
      message: "Project details fetched successfully",
      data: project,
    });
  } catch (error) {
    console.error("Error fetching project details:", error);
    res.status(500).send("Error fetching project details");
  }
});

const createProject = asyncHandler(async (req, res) => {
  try {
    const { title, description, goals, timeline, budget, progress, faculty, department } = req.body;
    const newProject = new Project({
      title,
      description,
      goals,
      timeline,
      budget,
      progress,
      faculty,
      department,
    });
    const savedProject = await newProject.save();
    console.log("Project created:", savedProject);
    res.status(201).json({
      status: "success",
      message: "Project created successfully",
      data: savedProject,
    });
  } catch (error) {
    console.error("Error creating project:", error);
    res.status(500).json({ message: "Error creating project" });
  }
});

export { getAllProjects, getProjectDetails, createProject };
