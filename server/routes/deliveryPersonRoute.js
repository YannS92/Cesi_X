const express = require('express');
const deliveryPersonRouter = express.Router();
const DeliveryPerson = require('../models/delivery-person');
const isAuth = require("../middleware/passport");
const Order = require('../models/Order');
const SubOrder = require('../models/SubOrder');

// Create a new delivery person
deliveryPersonRouter.post('/', async (req, res) => {
    const { userId, vehicleDetails } = req.body;
    try {
        const newDeliveryPerson = new DeliveryPerson({ userId, vehicleDetails });
        await newDeliveryPerson.save();
        res.status(201).json(newDeliveryPerson);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get all delivery persons
deliveryPersonRouter.get('/all', isAuth(), async (req, res) => {
    try {
        const deliveryPersons = await DeliveryPerson.find().populate('userId', 'name email phone');
        res.status(200).json(deliveryPersons);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get a delivery person by ID
deliveryPersonRouter.get('/:id', isAuth(), async (req, res) => {
    const { id } = req.params;
    try {
        const deliveryPerson = await DeliveryPerson.findById(id).populate('userId', 'name email phone');
        if (!deliveryPerson) return res.status(404).json({ message: "Delivery person not found" });
        res.status(200).json(deliveryPerson);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get a delivery person by user ID
deliveryPersonRouter.get('/user/:userId', isAuth(), async (req, res) => {
    const { userId } = req.params;
    try {
        const deliveryPerson = await DeliveryPerson.findOne({ userId }).populate('userId', 'name email phone');
        if (!deliveryPerson) return res.status(404).json({ message: "Delivery person not found" });
        res.status(200).json(deliveryPerson);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Update a delivery person's availability
deliveryPersonRouter.put('/update/availability/:id', isAuth(), async (req, res) => {
    const { id } = req.params;
    const { available } = req.body;
    try {
        const deliveryPerson = await DeliveryPerson.findByIdAndUpdate(id, { available }, { new: true }).populate('userId', 'name email phone');
        if (!deliveryPerson) return res.status(404).json({ message: "Delivery person not found" });
        res.status(200).json(deliveryPerson);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Update a delivery person
deliveryPersonRouter.put('/update/:id', isAuth(), async (req, res) => {
    const { id } = req.params;
    const { vehicleDetails, available } = req.body;
    try {
        const deliveryPerson = await DeliveryPerson.findByIdAndUpdate(id, { vehicleDetails, available }, { new: true }).populate('userId', 'name email phone');
        if (!deliveryPerson) return res.status(404).json({ message: "Delivery person not found" });
        res.status(200).json(deliveryPerson);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete a delivery person
deliveryPersonRouter.delete('/delete/:id', isAuth(), async (req, res) => {
    const { id } = req.params;
    try {
        const deliveryPerson = await DeliveryPerson.findByIdAndDelete(id);
        if (!deliveryPerson) return res.status(404).json({ message: "Delivery person not found" });
        res.status(200).json({ message: "Delivery person deleted successfully" });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});
//-----------------------------------------------------------------
//                   Order Section
//-----------------------------------------------------------------
deliveryPersonRouter.post('/validateOrder/:orderId', isAuth(), async (req, res) => {
    try {
        const { orderId } = req.params;
        const order = await Order.findById(orderId);

        if (order.OrderStatus === 'Pending') {
            order.OrderStatus = 'DeliveryValidated';
        } else if (order.OrderStatus === 'RestaurantValidated') {
            order.OrderStatus = 'Validated';
        }

        await order.save();
        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = deliveryPersonRouter;
