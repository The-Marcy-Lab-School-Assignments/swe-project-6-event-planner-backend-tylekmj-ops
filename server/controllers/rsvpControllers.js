const rsvpModel = require('../models/rsvpModel');
const eventModel = require('../models/eventModel');

// POST /api/events/:event_id/rsvps
const createRsvp = async (req, res, next) => {
  try {
    const eventId = Number(req.params.event_id);
    const userId = req.session.userId;

    const event = await eventModel.find(eventId);
    if (!event) return res.status(404).send({ message: 'Event not found.' });

    const rsvp = await rsvpModel.create(userId, eventId);
    res.status(201).send(rsvp);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/events/:event_id/rsvps
const deleteRsvp = async (req, res, next) => {
  try {
    const eventId = Number(req.params.event_id);
    const userId = req.session.userId;

    const rsvp = await rsvpModel.destroyByUserAndEvent(userId, eventId);
    res.send(rsvp);
  } catch (err) {
    next(err);
  }
};

// GET /api/users/:user_id/rsvps
const listUserRsvps = async (req, res, next) => {
  try {
    const userId = Number(req.params.user_id);
    const rsvps = await rsvpModel.listByUser(userId);
    res.send(rsvps);
  } catch (err) {
    next(err);
  }
};

module.exports = { createRsvp, deleteRsvp, listUserRsvps };