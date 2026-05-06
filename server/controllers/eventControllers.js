const eventModel = require('../models/eventModel');

// GET /api/events
const listEvents = async (req, res, next) => {
  try {
    const events = await eventModel.list();
    res.send(events);
  } catch (err) {
    next(err);
  }
};

// GET /api/users/:user_id/events
const listUserEvents = async (req, res, next) => {
  try {
    const userId = Number(req.params.user_id);
    const events = await eventModel.listByUser(userId);
    res.send(events);
  } catch (err) {
    next(err);
  }
};

// POST /api/events
const createEvent = async (req, res, next) => {
  try {
    const { title, description, date, location, event_type, max_capacity } = req.body;
    const userId = req.session.userId;

    if (!title || !date || !location || !event_type || !max_capacity) {
      return res.status(400).send({ message: 'title, date, location, event_type, and max_capacity are required.' });
    }

    const event = await eventModel.create(title, description, date, location, event_type, max_capacity, userId);
    res.status(201).send(event);
  } catch (err) {
    next(err);
  }
};

// PATCH /api/events/:event_id
const updateEvent = async (req, res, next) => {
  try {
    const eventId = Number(req.params.event_id);

    // Only the event owner can update it
    const existing = await eventModel.find(eventId);
    if (!existing) return res.status(404).send({ message: 'Event not found.' });
    if (existing.user_id !== req.session.userId) {
      return res.status(403).send({ message: 'You can only update your own events.' });
    }

    const { title, description, date, location, event_type, max_capacity } = req.body;
    const event = await eventModel.update(eventId, title, description, date, location, event_type, max_capacity);
    res.send(event);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/events/:event_id
const deleteEvent = async (req, res, next) => {
  try {
    const eventId = Number(req.params.event_id);

    // Only the event owner can delete it
    const existing = await eventModel.find(eventId);
    if (!existing) return res.status(404).send({ message: 'Event not found.' });
    if (existing.user_id !== req.session.userId) {
      return res.status(403).send({ message: 'You can only delete your own events.' });
    }

    const event = await eventModel.destroy(eventId);
    res.send(event);
  } catch (err) {
    next(err);
  }
};

module.exports = { listEvents, listUserEvents, createEvent, updateEvent, deleteEvent };