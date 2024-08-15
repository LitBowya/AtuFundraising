import express from "express";
import asyncHandler from "../middleware/asyncHandler.js";
import User from "../models/userModel.js";
import Donation from "../models/donationModel.js";
import { uploadSingleImage } from "../routes/uploadRoutes.js";
import generateToken from "../utils/generateToken.js";
import logger from "../logger.js";
import dotenv from "dotenv";

const router = express.Router();
const app = express();

dotenv.config();

const registerUser = asyncHandler(async (req, res) => {
  logger.debug("Register user route hit");
  uploadSingleImage(req, res, async (err) => {
    if (err) {
      logger.error(`Image upload failed: ${err.message}`);
      return res.status(400).send({ message: "Image upload failed" });
    }

    const {
      name,
      username,
      email,
      password,
      phoneNumber,
      isAdmin,
      isAlumni, // This is coming as "on" or undefined
      alumniDetails,
    } = req.body;

    logger.debug(`Received registration data for email: ${email}`);

    const userExists = await User.findOne({ email });
    if (userExists) {
      logger.warn(`User already exists: ${email}`);
      return res.status(400).send({ message: "User already exists" });
    }

    // Convert "on" to true or default to false
    const isAlumniBoolean = isAlumni === "on" ? true : false;

    const newUser = await User.create({
      name,
      username,
      email,
      password,
      profilePicture: req.file.path,
      phoneNumber,
      isAdmin,
      isAlumni: isAlumniBoolean, // Set the boolean value
      alumniDetails: isAlumniBoolean ? alumniDetails : null,
    });

    if (newUser) {
      logger.debug(`User registered successfully: ${newUser.email}`);

      return res.redirect("/login");
    } else {
      logger.error("Invalid user data");
      res.status(400).send({ message: "Invalid user data" });
    }
  });
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  logger.debug(`Attempting login for email: ${email}`);

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      generateToken(res, user._id);

      logger.info(`User ${email} logged in successfully`);

      res.status(200).json({
        success: true,
        message: "Logged In Successfully",
        data: {
          _id: user._id,
          username: user.username,
          name: user.name,
          email: user.email,
          profilePicture: user.profilePicture,
          isAdmin: user.isAdmin,
          isAlumni: user.isAlumni,
          alumniDetails: user.isAlumni ? user.alumniDetails : null,
        },
      });
    } else {
      logger.warn(`Invalid email or password for email: ${email}`);
      res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }
  } catch (error) {
    logger.error(`Error logging in for email: ${email}`, error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});

const logoutUser = asyncHandler(async (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });

  res.status(200).json({ message: "Logged out successfully" });
});

const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    if (req.xhr || req.headers.accept.indexOf("json") > -1) {
      // Respond with JSON data
      res.json({
        success: true,
        user: {
          _id: user._id,
          username: user.username,
          name: user.name,
          email: user.email,
          profilePicture: user.profilePicture,
          isAdmin: user.isAdmin,
          isAlumni: user.isAlumni,
          alumniDetails: user.isAlumni ? user.alumniDetails : null,
        },
      });
    } else {
      // Render the EJS view for the profile page
      res.render("pages/ProfilePage", {
        title: "Profile Page",
        user: {
          _id: user._id,
          username: user.username,
          name: user.name,
          email: user.email,
          profilePicture: user.profilePicture,
          isAdmin: user.isAdmin,
          isAlumni: user.isAlumni,
          alumniDetails: user.isAlumni ? user.alumniDetails : null,
        },
      });
    }
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.username = req.body.username || user.username;
    user.email = req.body.email || user.email;
    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.status(200).json({
      message: "User profile changed successfully",
      data: {
        _id: updatedUser._id,
        name: updatedUser.name,
        username: user.username,
        email: updatedUser.email,
        isAdmin: updatedUser.isAdmin,
      },
    });
  } else {
    res.status(200);
    throw new Error("User not found");
  }
});

const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({});
  res.json(users);
});

const getUserById = asyncHandler(async (req, res) => {
  const id = req.params.id;
  console.log(`Fetching user with ID: ${id}`);

  // Check if the provided ID is a valid MongoDB ObjectId
  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    res.status(400);
    throw new Error("Invalid user ID");
  }

  try {
    const user = await User.findById(id).select("-password");
    console.log("User found:", user);

    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404);
      throw new Error("User not found");
    }
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500);
    throw new Error("Server error");
  }
});

const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    if (user.isAdmin) {
      res.status(400);
      throw new Error("Can not delete admin user");
    }
    await User.deleteOne({ _id: user._id });
    res.json({ message: "User removed" });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    user.name = req.body.name || user.name;
    user.username = req.body.username || user.username;
    user.email = req.body.email || user.email;
    user.isAdmin = Boolean(req.body.isAdmin);

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      username: updatedUser.username,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

export {
  loginUser,
  logoutUser,
  registerUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
  getUserById,
  deleteUser,
  updateUser,
};

export default router;
