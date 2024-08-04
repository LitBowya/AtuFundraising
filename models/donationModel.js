import mongoose from "mongoose";

const donationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
  amount: Number,
  date: Date
}, {
  timestamps: true,
});
const Donation = mongoose.model("Donation", donationSchema);

export default Donation;
