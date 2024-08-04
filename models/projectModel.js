import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    goals: String,
    timeline: String,
    budget: {
      type: Number,
      required: true,
      min: 0,
    },
    amountLeft: {
      type: Number,
      min: 0,
      default: function () {
        return this.budget;
      },
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
