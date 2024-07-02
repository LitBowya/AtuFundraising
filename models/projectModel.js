import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
    title: String,
    description: String,
    goals: String,
    timeline: String,
    budget: Number,
    progress: String,
    faculty: String,
    department: String,
    images: []
  });
  const Project = mongoose.model('Project', projectSchema);
  export default Project;