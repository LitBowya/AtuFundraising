import Event from "../models/eventModel.js";
import asyncHandler from "../middleware/asyncHandler.js";
import logger from "../logger.js";
import moment from "moment-timezone";

// Create a new event
const createEvent = asyncHandler(async (req, res) => {
  const { title, description, date, time, venue, goals, type, purpose } =
    req.body;
  const images = req.files.map((file) => `/${file.path}`);

  try {
    const event = await Event.create({
      title,
      description,
      date,
      time,
      venue,
      goals,
      type,
      images,
      purpose,
    });

    logger.info(`Event ${event.title} created successfully`);
    res.status(201).json({ success: true, event });
  } catch (error) {
    logger.error("Error creating event:", error);
    res.status(500).json({
      success: false,
      message: "Error creating event",
    });
  }
});

// Get all events, sorted by most recent
const getEvents = asyncHandler(async (req, res) => {
  try {
    const events = await Event.find({}).sort({ createdAt: -1 });

    if (!events || events.length === 0) {
      return res.status(200).json({ message: "No events found" });
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

// Get a single event by ID
const getEventById = asyncHandler(async (req, res) => {
  const eventId = req.params.id;

  try {
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    res.render("pages/EventsDetailsPage", {
      title: "Event Details",
      event,
    });
  } catch (error) {
    logger.error(`Error fetching event with ID ${eventId}:`, error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});

// Edit an existing event
const editEvent = asyncHandler(async (req, res) => {
  const eventId = req.params.id;
  const { title, description, date, time, venue, goals, type, purpose } =
    req.body;
  const images = req.files
    ? req.files.map((file) => `/${file.path}`)
    : undefined;

  try {
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    event.title = title || event.title;
    event.description = description || event.description;
    event.date = date || event.date;
    event.time = time || event.time;
    event.venue = venue || event.venue;
    event.goals = goals || event.goals;
    event.type = type || event.type;
    event.purpose = purpose || event.purpose;
    if (images) {
      event.images = images;
    }

    await event.save();

    logger.info(`Event ${event.title} updated successfully`);
    res.status(200).json({ success: true, event });
  } catch (error) {
    logger.error(`Error updating event with ID ${eventId}:`, error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});

// Delete an event
const deleteEvent = asyncHandler(async (req, res) => {
  const eventId = req.params.id;

  try {
    const event = await Event.findByIdAndDelete(eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    logger.info(`Event ${event.title} deleted successfully`);
    res
      .status(200)
      .json({ success: true, message: "Event deleted successfully" });
  } catch (error) {
    logger.error(`Error deleting event with ID ${eventId}:`, error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});

export { createEvent, getEvents, getEventById, editEvent, deleteEvent };
