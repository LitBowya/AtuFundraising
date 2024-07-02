import asyncHandler from "../middleware/asyncHandler.js";
import Donation from "../models/donationModel.js";
import User from "../models/userModel.js";

const createDonation = asyncHandler(async (req, res) => {
  try {
    
    const { amount, recurring, frequency } = req.body;
    const userId = await User.findById(req.user._id);
    const newDonation = new Donation({
      userId,
      amount,
      date: new Date(),
      recurring,
      frequency,
    });
    const saveDonation = await newDonation.save();
    console.log("Donation created:", newDonation);
    res.status(200).json({message: "donation created successfully", data: saveDonation});
  } catch (error) {
    console.error("Error creating donation:", error);
    res.status(404).json({message: "Error creating donation"});
  }
});

const getDonationHistory = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    const donations = await Donation.find({ userId });
    res.status(200).json({message: "Donation history", data: donations});
  } catch (error) {
    console.error("Error fetching donation history:", error);
    res.status(500).send("Error fetching donation history");
  }
});

const setupRecurringDonation = asyncHandler(async (req, res) => {
  try {
    const { userId, amount, frequency } = req.body;
    const recurringDonation = new Donation({
      userId,
      amount,
      date: new Date(),
      recurring: true,
      frequency,
    });
    await recurringDonation.save();
    console.log("Recurring donation set up:", recurringDonation);
    res.status(200).json({message: "Recurring donation set up", data: recurringDonation});
  } catch (error) {
    console.error("Error setting up recurring donation:", error);
    res.status(500).send("Error setting up recurring donation");
  }
});

export {createDonation, getDonationHistory, setupRecurringDonation}