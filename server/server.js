const express = require("express");
const cors = require("cors");
require("dotenv").config();

const mongoose = require("mongoose");
const db_connect = require("./config/db_connect");

const app = express();

db_connect();
app.use(express.json());
app.use(cors());

// Define the schema for the data collection

const userRoute = require("./routes/userRoute");
const articleRoute = require('./routes/articleRoute');
const restaurantRoute = require('./routes/restaurantRoute');
const deliveryPersonRoute = require('./routes/deliveryPersonRoute');
const menuRoute = require('./routes/menuRoute');
const notifRoute = require('./routes/notifRoute');
const paymentRoute = require('./routes/paymentRoute');
const uploadRoute = require('./routes/imageRoute');
const orderRoute = require('./routes/orderRoute');
const emailRoute = require('./routes/emailRoute');


// ------------------------ our routes----------------------------
app.use("/user", userRoute);
app.use('/article', articleRoute);
app.use('/restaurant', restaurantRoute);
app.use('/deliveryPerson', deliveryPersonRoute);
app.use('/menu', menuRoute);
app.use('/notifications', notifRoute);
app.use('/payments', paymentRoute);
app.use('/image', uploadRoute);
app.use('/order', orderRoute);
app.use('/email', emailRoute);

app.use("/testemails", emailRoute);

// ------------------------ end our routes------------------------

PORT = process.env.PORT || 5000;

//test our server
app.listen(PORT, (err) =>
  err ? console.log(err) : console.log("server is running")
);