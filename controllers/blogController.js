import asyncHandler from "../middleware/asyncHandler";
import User from "../models/userModel";
import Blog from "../models/blogModel";

const createBlog = asyncHandler(async (req, res) => {
  const { title, content, images } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    res.status(200).json({ message: "You are not registered" });
  }

  const blog = await Blog.create({
    title,
    content,
    images,
  });

  const saveBlog = await blog.save();

  if (blog) {
    res.status(200).json({ status: "success", data: saveBlog });
  } else {
    res.status(400);
    throw new Error("Error creating blog");
  }
});

export { createBlog };
