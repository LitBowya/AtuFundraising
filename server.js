// Importing packages needed
import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import { config } from "dotenv";

// Importing database and needed security files
import database from "./config/config.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// importing routes
import userRoutes from "./routes/userRoutes.js";
import donationRoutes from "./routes/donationRoutes.js";
import paystackRoutes from "./routes/paystackRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";

import Project from "./models/projectModel.js";
import Donation from "./models/donationModel.js";
import User from "./models/userModel.js";
import Event from "./models/eventModel.js";

import logger from "./logger.js";

config();
const app = express();

// Connect to database
await database();

// Middleware for parsing request bodies
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware for parsing cookies
app.use(cookieParser());

// Setting ejs templating engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/auth-status", async (req, res) => {
  const token = req.cookies.jwt;
  console.log(token);

  if (!token) {
    return res.status(401).json({ authenticated: false });
  } else {
    return res.status(200).json({ authenticated: true });
  }
});

app.get("/", async (req, res) => {
  try {
    const projects = await Project.find({}).sort({ createdAt: -1 });
    const donations = await Donation.find({}).sort({ createdAt: -1 });
    const events = await Event.find({}).sort({ createdAt: -1 });

    // Calculate total amount donated by each user
    const userDonations = {};

    donations.forEach((donation) => {
      if (!userDonations[donation.userId]) {
        userDonations[donation.userId] = 0;
      }
      userDonations[donation.userId] += donation.amount;
    });

    // Create an array of users with their total donations
    const topDonors = [];
    for (const userId in userDonations) {
      const user = await User.findById(userId);
      if (user) {
        topDonors.push({
          user,
          totalDonation: userDonations[userId],
        });
      } else {
        logger.debug(`User that is having the ID ${userId} not found.`);
      }
    }

    // Sort users based on total donations (highest to lowest)
    topDonors.sort((a, b) => b.totalDonation - a.totalDonation);

    // Render the index page with sorted data
    res.render("index", {
      title: "Homepage",
      projects,
      topDonors,
      donations,
      events,
    });
  } catch (error) {
    // Error logging
    logger.error("Error fetching data:", error);
    res.status(500).send("Error fetching data");
  }
});

app.get("/about", (req, res) => {
  res.render("pages/AboutUsPage", { title: "About Us" });
});

app.get("/register", (req, res) => {
  res.render("pages/RegisterPage", { title: "Register" });
});

app.get("/login", (req, res) => {
  res.render("pages/LoginPage", { title: "Login" });
});

app.get("/contact-us", (req, res) => {
  res.render("pages/ContactUsPage", { title: "Contact Us" });
});

app.get("/donations", async (req, res) => {
  const donations = await Donation.find({})
    .populate({
      path: "userId",
      select: "name profilePicture",
    })
    .populate({
      path: "projectId",
      select: "title description",
    });

  res.render("partials/Admin/alldonations", {
    title: "All Donations",
    donations,
  });
});

app.get("/sales", async (req, res) => {
  res.render("partials/Admin/mainpage", { title: "Sales" });
});

app.get("/admin", async (req, res) => {
  try {
    // Fetch all projects, users, events, etc.
    const allProjects = await Project.find({});
    const allUsers = await User.find({});
    const allDonations = await Donation.find({});
    const allEvents = await Event.find({});
    const allAlumni = await User.find({ isAlumni: true });
    const allNonAlumni = await User.find({ isAlumni: false });

    // Calculate the total amount from donations
    const [totalDonationResult] = await Donation.aggregate([
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
        },
      },
    ]);
    const totalAmount = totalDonationResult
      ? totalDonationResult.totalAmount
      : 0;

    // Aggregate donations by month
    const monthlyData = {};
    allDonations.forEach((donation) => {
      const month = new Date(donation.date);
      const monthYear = month.toLocaleString("default", {
        month: "short",
        year: "numeric",
      });
      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = 0;
      }
      monthlyData[monthYear] += donation.amount;
    });

    // Prepare data for the chart
    const months = Object.keys(monthlyData).sort(
      (a, b) => new Date(a) - new Date(b)
    ); // Chronological order
    const amounts = months.map((month) => monthlyData[month]);

    // Render the AdminHomePage view and pass chart data
    res.render("pages/Admin/AdminHomePage", {
      title: "Admin",
      projects: allProjects,
      users: allUsers,
      donations: allDonations,
      events: allEvents,
      alumni: allAlumni,
      nonAlumni: allNonAlumni,
      totalDonationAmount: totalAmount,
      months: months,
      amounts: amounts,
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/events/fetchEvents", async (req, res) => {
  try {
    const events = await Event.find({}).sort({ createdAt: -1 });
    res.render("partials/Admin/createevents", {
      title: "Create Event",
      events,
    });
  } catch (error) {
    console.error("Error fetching events:", error);
    res.render("partials/Admin/createevents", {
      title: "Create Event",
      events: [],
    });
  }
});

app.get("/projects/create", async (req, res) => {
  const projects = await Project.find({}).sort({ createdAt: -1 });
  res.render("partials/Admin/createproject", {
    title: "Create Project",
    projects,
  });
});

app.get("/users", async (req, res) => {
  const users = await User.find({});
  res.render("partials/Admin/allusers", {
    title: "All Users",
    users,
  });
});

app.get("/events/createevents", async (req, res) => {
  res.render("partials/Admin/createeventsform", { title: "Create Event Form" });
});

app.get("/projects/createproject", async (req, res) => {
  res.render("partials/Admin/createprojectform", {
    title: "Create Project Form",
  });
});

// Handling routes
app.use("/users", userRoutes);
app.use("/donations", donationRoutes);
app.use("/paystack", paystackRoutes);
app.use("/projects", projectRoutes);
app.use("/events", eventRoutes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

app.listen(process.env.PORT, () =>
  console.log(`App listening on port ${process.env.PORT}!`)
);
