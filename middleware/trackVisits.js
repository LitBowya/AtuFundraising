import Visit from "../models/visitModel.js";

// Middleware to track visits
const trackVisits = async (req, res, next) => {
  try {
    const visitCookie = req.cookies.visitLogged;

    if (!visitCookie) {
      // Only log the visit if the cookie is not present
      const visitInfo = {
        path: "Website", // Generalized to the entire website
        ip: req.ip,
        userAgent: req.headers["user-agent"],
        timestamp: new Date(),
      };

      console.log("Visit logged:", visitInfo);

      // Save visit to the database
      await Visit.create(visitInfo);

      // Set a cookie to avoid multiple logs from the same user
      res.cookie("visitLogged", true, {
        maxAge: 30 * 60 * 1000, // Cookie expires after 30 minutes
        httpOnly: true,
      });
    }
  } catch (error) {
    console.error("Error logging visit:", error);
  }
  next();
};

export default trackVisits;
