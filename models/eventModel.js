import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
    title: String,
    description: String,
    date: Date,
    venue: String,
    type: String // 'fundraising', 'reunion', 'volunteer'
  });
  const Event = mongoose.model('Event', eventSchema);
  export default Event;