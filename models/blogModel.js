import mongoose from "mongoose";

const blogSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    images:{
        type: Array,
        required: true
    }
  },{
    timestamps: true
  });
  const Blog = mongoose.model('Blog', blogSchema);
 
  export default Blog