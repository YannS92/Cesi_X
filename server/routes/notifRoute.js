const express = require("express");
const notifRoute = express.Router();
const Notification = require('../models/Notif');

notifRoute.post('/', async (req, res) => {
    const { userId, message } = req.body;

    try {
        const notification = new Notification({
            userId,
            message,
            createdAt: new Date(),
        });
        await notification.save();
        res.status(201).json(notification);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

notifRoute.get('/', async (req, res) => {
    const { userId } = req.query;

    try {
        const notifications = await Notification.find({ userId }).sort({ createdAt: -1 }).limit(5);
        res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

notifRoute.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await Notification.findByIdAndDelete(id);
        res.status(200).send({ message: 'Notification deleted successfully' });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

module.exports = notifRoute;
