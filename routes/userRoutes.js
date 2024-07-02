import express from "express";
import {
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
} from "../controllers/userController.js";
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.post("/register", registerUser);
router.post("/update-privacy", updatePrivacySettings);
router
  .route("/profile")
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);
router.route("/").get(protect, admin, getUsers);
router
  .route("/:id")
  .get(protect, admin, getUserById)
  .delete(protect, admin, deleteUser)
  .put(protect, admin, updateUser);

export default router;