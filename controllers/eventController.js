import Event from "../models/eventModel.js";
import asyncHandler from "../middleware/asyncHandler.js";
import logger from "../logger.js";

const createEvent = asyncHandler(async (req, res) => {
    const { title, description, date, venue, type, purpose } = req.body;
    
    const images = req.files.map((file) => `/${file.path}`);

  try {
    const event = await Event.create({
      title,
      description,
      date,
      venue,
      type,
      images,
      purpose,
    });

    logger.info(`Event ${event.title} created successfully`);
    res.status(201).json({
      success: true,
      message: "Event created successfully",
      data: event,
    });
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
      const events = await Event.find({}).sort({ date: -1 });
      
      if (!events) {
          res.status(200).json({message: "Events not found"})
      } else {
          res.render('pages/EventsPage', {title: "Events Page", events})
      }

    // res.status(200).json({
    //   success: true,
    //   message: "Events fetched successfully",
    //   data: events,
    // });
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
      res.status(200).json({
        success: true,
        message: "Event fetched successfully",
        data: event,
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