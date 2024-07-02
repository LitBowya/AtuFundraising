import asyncHandler from "../middleware/asyncHandler.js";
import User from "../models/userModel.js";
import generateToken from "../utils/generateToken.js";
import dotenv from "dotenv";

dotenv.config();

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    generateToken(res, user._id);

    res.json({
      message: "Logged In Successfully",
      data: {
        _id: user._id,
        username: user.username,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        isAlumni: user.isAlumni,
        alumniDetails: user.isAlumni ? user.alumniDetails : null,
      }
    });

    console.log(user);
  } else {
    res.status(401);
    throw new Error("Invalid email or password");
  }
});

const logoutUser = asyncHandler(async (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });

  res.status(200).json({ message: "Logged out successfully" });
});

const registerUser = asyncHandler(async (req, res) => {
  const {
    name,
    username,
    email,
    password,
    profilePicture,
    phoneNumber,
    isAdmin,
    isAlumni,
    alumniDetails,
  } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  const newUser = await User.create({
    name,
    username,
    email,
    password,
    profilePicture,
    phoneNumber,
    isAdmin,
    isAlumni,
    alumniDetails: isAlumni ? alumniDetails : null,
  });

  if (newUser) {
    res.status(201).json({
      message: "Registered user successfully",
      data: {
        _id: newUser._id,
        name: newUser.name,
        username: newUser.username,
        email: newUser.email,
        profilePicture: newUser.profilePicture,
        isAdmin: newUser.isAdmin,
        isAlumni: newUser.isAlumni,
        alumniDetails: newUser.isAlumni ? newUser.alumniDetails : null,
      },
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.status(200).json({
      message: "User Profile",
      data: {
        _id: user._id,
        username: user.username,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
        isAdmin: user.isAdmin,
        isAlumni: user.isAlumni,
        alumniDetails: user.isAlumni ? user.alumniDetails : null,
      }
    });
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
      }
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
    throw new Error('Invalid user ID');
  }

  try {
    const user = await User.findById(id).select('-password');
    console.log('User found:', user);

    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500);
    throw new Error('Server error');
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

const updatePrivacySettings = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    const { showEmail, showPhoneNumber, showAddress } = req.body;
    const user = await User.findByIdAndUpdate(
      userId,
      { privacySettings: { showEmail, showPhoneNumber, showAddress } },
      { new: true }
    );
    console.log("Privacy settings updated:", user);
    res.redirect("/privacy-settings");
  } catch (error) {
    console.error("Error updating privacy settings:", error);
    res.status(500).send("Error updating privacy settings");
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
  updatePrivacySettings,
};
