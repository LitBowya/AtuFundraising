// routes/donationRoutes.js
import express from "express";
import {
  createDonation,
  getDonationHistory,
  getAllDonations,
  verifyDonation,
} from "../controllers/donationController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/donate/:id", protect, createDonation);
router.get("/verify/:reference", protect, verifyDonation);
router.get("/donation-history", protect, getDonationHistory);
router.get("/donate/getAllDonations", protect, admin, getAllDonations);

export default router;
