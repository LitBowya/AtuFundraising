import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    goals: {
      type: [String],
      required: true,
    },
    timeline: String,
    purpose: String,
    budget: {
      type: Number,
      required: true,
      min: 0,
    },
    amountContributed: {
      type: Number,
      min: 0,
      default: 0,
    },
    faculty: String,
    department: String,
    images: [],
  },
  {
    timestamps: true,
  }
);

const Project = mongoose.model("Project", projectSchema);
export default Project;
