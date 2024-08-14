import Event from "../models/eventModel.js";
import asyncHandler from "../middleware/asyncHandler.js";
import logger from "../logger.js";
import moment from "moment-timezone";

const createEvent = asyncHandler(async (req, res) => {
  const { title, description, date, time, venue, goals, type, purpose } =
    req.body;

  const images = req.files.map((file) => `/${file.path}`);

  try {
    const event = await Event.create({
      title,
      description,
      date,
      venue,
      time,
      goals,
      type,
      images,
      purpose,
    });

    logger.info(`Event ${event.title} created successfully`);
  } catch (error) {
    logger.error("Error creating event:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});

const getEvents = asyncHandler(async (req, res) => {
  try {
    const events = await Event.find({}).sort({ createdAt: -1 });

    if (!events || events.length === 0) {
      res.status(200).json({ message: "Events not found" });
      return;
    }

    const currentDate = moment.tz("Africa/Accra").startOf("day");
    const upcomingEvents = [];
    const pastEvents = [];

    events.forEach((event) => {
      const eventDate = moment(event.date).startOf("day");
      if (eventDate.isAfter(currentDate)) {
        upcomingEvents.push(event);
      } else {
        pastEvents.push(event);
      }
    });

    res.render("pages/EventsPage", {
      title: "Events Page",
      upcomingEvents,
      pastEvents,
    });
  } catch (error) {
    logger.error("Error fetching events:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});

const getEventById = asyncHandler(async (req, res) => {
  const eventId = req.params.id;

  try {
    const event = await Event.findById(eventId);

    if (!event) {
      res.status(404).json({
        success: false,
        message: "Event not found",
      });
    } else {
      res.render("pages/EventsDetailsPage", {
        title: "Event Details",
        event: event,
      });
    }
  } catch (error) {
    logger.error(`Error fetching event with ID ${eventId}:`, error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});

export { createEvent, getEvents, getEventById };
