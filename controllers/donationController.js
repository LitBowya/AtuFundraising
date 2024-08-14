import mongoose from "mongoose";
import asyncHandler from "../middleware/asyncHandler.js";
import Donation from "../models/donationModel.js";
import User from "../models/userModel.js";
import Project from "../models/projectModel.js";
import logger from "../logger.js";

import https from "https";

import paystack from "../utils/payment.js";

const makeDonation = async (projectId, amount) => {
  try {
    // Fetch the project by ID
    const project = await Project.findById(projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    // Calculate new amountContributed based on the donation
    project.amountContributed += amount;

    // Save updated project
    await project.save();
  } catch (error) {
    console.error("Error updating project amountContributed:", error);
    throw error;
  }
};

const createDonation = asyncHandler(async (req, res) => {
  logger.debug("Starting createDonation function");

  try {
    const { amount, projectId } = req.body;

    logger.debug(`Received request: projectId=${projectId}, amount=${amount}`);

    // Validate projectId
    if (!projectId) {
      const errorMessage = "Project ID is missing or invalid";
      logger.warn(errorMessage);
      return res.status(400).json({ message: errorMessage });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      logger.warn(`User not found: userId=${req.user._id}`);
      return res.status(404).json({ message: "User not found" });
    }

    logger.debug(`User found: ${user.email}`);

    const project = await Project.findById(projectId);
    if (!project) {
      logger.warn(`Project not found: projectId=${projectId}`);
      return res.status(404).json({ message: "Project not found" });
    }

    logger.debug(`Project found: ${project.title}`);

    logger.debug("Creating a one-time donation");

    const params = JSON.stringify({
      email: user.email,
      amount: amount * 100,
      metadata: { projectId },
    });

    const options = {
      hostname: "api.paystack.co",
      port: 443,
      path: "/transaction/initialize",
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    };

    const clientReq = https.request(options, (apiRes) => {
      let data = "";
      apiRes.on("data", (chunk) => {
        data += chunk;
      });
      apiRes.on("end", async () => {
        try {
          const response = JSON.parse(data);
          if (response.status) {
            logger.debug(
              `Payment initialized successfully: reference=${response.data.reference}`
            );

            res.status(200).json({
              message: "Payment initialized successfully",
              paymentUrl: response.data.authorization_url, // Redirect to Paystack checkout
              reference: response.data.reference,
            });
          } else {
            logger.error(`Payment initialization failed: ${response.message}`);
            res.status(400).json({ message: response.message });
          }
        } catch (error) {
          logger.error(`Error parsing Paystack API response: ${error.message}`);
          res.status(500).json({
            error: "An error occurred while processing your request",
          });
        }
      });
    });

    clientReq.on("error", (e) => {
      logger.error(`Request error: ${e.message}`);
      res
        .status(500)
        .json({ error: "An error occurred while processing your request" });
    });

    clientReq.write(params);
    clientReq.end();
  } catch (error) {
    logger.error(`Error initializing payment: ${error.message}`);
    res.status(500).json({ error: "An error occurred" });
  }
});

const verifyDonation = asyncHandler(async (req, res) => {
  try {
    const { reference } = req.params; // Get reference from URL params

    console.log("Reference gotten from the params", reference);

    // Verify payment with Paystack API
    const response = await paystack.get(`/transaction/verify/${reference}`);
    const { status, customer, paid_at, amount, metadata } = response.data.data;

    if (status === "success") {
      // Find user by email
      const user = await User.findOne({ email: customer.email });

      // Create a new donation record
      const newDonation = new Donation({
        userId: user._id,
        amount: parseFloat(amount) / 100,
        date: new Date(paid_at),
        projectId: metadata.projectId,
      });

      await newDonation.save(); // Save the donation to the database

      // Update project amountLeft
      await makeDonation(metadata.projectId, parseFloat(amount));

      console.log("Payment verified and donation created:", newDonation);
      res.status(200).json({
        message: "Payment verified and donation created",
        data: newDonation,
      });
    } else {
      res.status(400).json({ message: "Payment verification failed" });
    }
  } catch (error) {
    console.error("Error verifying payment:", error);
    res
      .status(500)
      .json({ error: "An error occurred while verifying payment" });
  }
});

const getAllDonations = asyncHandler(async (req, res) => {
  try {
    const donations = await Donation.find({}).populate(
      "userId",
      "name",
      "profilePicture"
    );
    if (!donations) {
      res.status(404).json({ message: "No donations found" });
    }

    console.log(donations);
    res.render("pages/ProjectPage", { donations });
    // res.status(200).json({ message: "Donations", data: donations });
  } catch (error) {
    console.error("Error fetching donations:", error);
    res.status(500).send("Error fetching donations");
  }
});

const getDonationHistory = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    const donations = await Donation.find({ userId });
    res.status(200).json({ message: "Donation history", data: donations });
  } catch (error) {
    console.error("Error fetching donation history:", error);
    res.status(500).send("Error fetching donation history");
  }
});

export { createDonation, verifyDonation, getDonationHistory, getAllDonations };
